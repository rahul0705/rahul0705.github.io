---
title: Make the Wrong Thing Hard to Do
draft: false
description: Tribal knowledge asks engineers to remember the rules. Good system design can make many of those rules difficult to break in the first place.
tableOfContents: false
section: Process
tags:
  - software
  - development
  - design
  - architecture
coverImage: ../../assets/covers/make-the-wrong-thing-hard-to-do.jpg
coverImageAlt: A winding mountain road bordered by a metal guardrail and speed limit sign
---

Most software has rules that aren't written in code. At work, we call this _tribal knowledge_: the things everyone on
the team just _knows_, even though nothing in the system says so.

Maybe you have to call one function before another. Maybe two configuration values have to change together. Maybe a
field is technically optional, but only because one very specific workflow doesn't use it. Maybe everyone on the team
knows you should never call an API without checking something else first.

Eventually, someone gets it wrong.

The usual response is documentation: add a comment, update the README, put a warning in the runbook, mention it in code
review, add another item to the onboarding guide.

I've done all of those things. Sometimes they're exactly the right answer.

But they're also attempts to write tribal knowledge down, and they share the same weakness: they depend on someone
knowing there's something to remember.

Sometimes the better solution is to change the system so nobody has to remember at all.

## Documentation Isn't a Constraint

Imagine an API that creates a resource and then requires a second call to activate it:

```python
resource = create_resource()
activate_resource(resource)
```

Every caller is expected to know that `activate_resource()` must follow `create_resource()`. Maybe there's even a
helpful comment:

```python
# IMPORTANT: Always activate resources after creation.
resource = create_resource()
activate_resource(resource)
```

The comment is correct. The documentation is clear. And sooner or later someone will write this:

```python
resource = create_resource()
return resource
```

They aren't necessarily careless. They may not know about the rule. They may be working in a different part of the
codebase. They may reasonably assume that a function called `create_resource()` returns a resource that's ready to use.

The interface allowed them to do something the system considers invalid.

When I see a mistake like this happen more than once, I've learned to be a little suspicious of blaming the caller.
Sometimes the caller made a mistake. Sometimes the interface gave them a perfectly reasonable way to make one.

If every successfully created resource should be activated, maybe activation was never a separate operation:

```python
def create_resource() -> Resource:
    resource = _create_resource()
    _activate_resource(resource)
    return resource
```

Now callers don't need to remember the rule.

The documentation didn't get better.

**The rule disappeared.**

## Make Invalid States Difficult to Represent

The same problem shows up in data models. Suppose a job can authenticate with either an API key or a username and
password:

```python
@dataclass
class JobConfig:
    api_key: str | None = None
    username: str | None = None
    password: str | None = None
```

This model can represent all sorts of states, and only some of them make sense:

| Fields set | Valid? |
| --- | --- |
| `api_key` only | Valid |
| `username` + `password` | Valid |
| `username` only | Invalid |
| `password` only | Invalid |
| `api_key` + `username` + `password` | Probably invalid |
| Nothing | Invalid |

The type technically works, but it pushes the rules somewhere else. Now every consumer needs to know which combinations
are valid, or every entry point has to remember to call validation.

We could add that validation:

```python
def validate(config: JobConfig) -> None:
    ...
```

Sometimes that's exactly the right call. But there's a better question to ask first:

Why can the system represent these invalid combinations in the first place?

Maybe authentication is really two different concepts:

```python
@dataclass
class ApiKeyAuth:
    api_key: str


@dataclass
class PasswordAuth:
    username: str
    password: str


@dataclass
class JobConfig:
    auth: ApiKeyAuth | PasswordAuth
```

We've written a little more code, but we've removed several possible mistakes. There's no longer a `username` without a
`password`. No configuration can contain both authentication methods. Nobody has to memorize the valid combinations,
and a type checker like mypy or pyright can catch the wrong shape before the code ever runs.

The structure carries the rule.

That's often more valuable than another paragraph explaining it.

## If a Machine Can Enforce It, Let the Machine Enforce It

This principle isn't limited to APIs and types. Code review is a good example.

I've spent enough time on both sides of code reviews to know how easy it is for mechanical feedback to consume the
conversation. Formatting, imports, generated files, naming conventions — individually they're small things, but
collectively they take attention away from the parts of a change that actually need a human.

Those are expensive uses of human attention, and most of them don't need a human at all:

- If a formatter can decide it deterministically, run the formatter.
- If a linter can detect it, run the linter.
- If a build can verify it, make the build verify it.
- If a test can establish the invariant, write the test.

Humans are valuable because we're capable of judgment. We can ask whether an abstraction makes sense, whether the change
solves the right problem, or whether an implementation creates a risk nobody considered.

Every minute spent checking something a machine could have rejected automatically is a minute not spent on those
questions.

A good engineering system doesn't just tell people how to do the right thing. It makes the right thing the easiest path.

## Defaults Are Constraints Too

Sometimes making the wrong thing hard doesn't require an elaborate type or another validation layer. Sometimes it just
requires a good default.

Imagine every service has to configure a retry policy:

```yaml
retry:
  attempts: 3
  initial_delay_ms: 250
  multiplier: 2
  max_delay_ms: 5000
```

Maybe those values genuinely need to vary.

But if almost every service uses exactly the same ones, those four settings are decisions that aren't really decisions.
Every new service has to copy them. Every engineer has to wonder whether to change them. Every configuration can drift.

A sensible default changes the problem. Instead of requiring every caller to provide the common retry policy, the client
can provide it:

```python
client = Client()
```

The unusual case is still supported:

```python
client = Client(retry_policy=custom_retry_policy)
```

It's a small example, but the principle matters.

Good defaults don't just save typing. They reduce the number of decisions people have to get right.

I've found that some of the easiest systems to work with aren't necessarily the ones with the most options. They're the
ones where I rarely have to think about an option until I actually need to change it.

## Guardrails Have a Cost

There's an obvious way to take this too far.

If every possible mistake gets another abstraction, validation layer, wrapper, permission, approval step, or automated
check, eventually the guardrails become the system. We've all used software where doing something perfectly reasonable
means fighting through layers designed to prevent hypothetical misuse.

A guardrail is complexity, and like any other complexity, it has to earn its place.

The question isn't whether we _can_ prevent someone from doing something wrong. Given enough code, the answer is usually
yes.

The better questions are:

- How likely is this mistake?
- What happens when someone makes it?
- Can we eliminate the possibility cheaply?

A destructive database operation deserves stronger protection than a poorly chosen variable name. An authentication
invariant deserves stronger enforcement than a preference about directory structure.

Not every mistake needs to become impossible.

Some should simply be easy to notice and easy to fix.

There's a second risk: once you encode a rule into the system, you've made an architectural decision. Sometimes that's
exactly what you want. If a resource can never exist without an owner, making `owner` required is useful. If an operation
must always be authorized, putting authorization inside the boundary is safer than expecting every caller to remember it.

But sometimes what looks like an invariant is really just how the system happens to work today.

If we aggressively encode assumptions we don't fully understand, we can make tomorrow's legitimate change unnecessarily
difficult.

So the goal isn't to make everything rigid. It's to tell the difference between things that are genuinely invalid and
things that are merely uncommon.

That's harder than writing the validation.

It takes judgment.

## Look for Repeated Reminders

One of the signals I've learned to watch for is repetition.

The first time someone forgets something, it might just be a mistake. By the fifth time, I'm less interested in who
forgot and more interested in why the system keeps asking people to remember.

Watch for:

- The same comment: _"Remember to call this after that."_
- The same review feedback: _"Don't forget to update this file too."_
- The same production issue: _"These two values got out of sync again."_
- The same line in every runbook: _"Never perform this operation before checking that."_

At some point, the problem may not be that people keep forgetting.

The system may be asking them to remember too much.

Repeated reminders are often a sign that tribal knowledge is doing work the system should be doing. That rule may belong
somewhere other than a person's head: in a type, an API, a test, the build, or a default.

Or maybe two operations everyone has been told to perform together were really one operation all along.

## Design for the Engineer Who Doesn't Know the Rule

It's easy to use a system correctly when you helped build it.

You know which functions behave surprisingly, which configuration values have to match, and which comments matter. You
remember the production incident behind the strange validation check from three years ago. You know why one function
absolutely must be called before the other, because you were there the day someone found out what happens when it isn't.

The next engineer doesn't.

I've worked on systems with years of history behind them, and one thing that becomes obvious over time is how much
context can accumulate in the people rather than the code. That's manageable right up until those people change teams,
leave the company, or simply forget why a decision was made.

Tribal knowledge only works for the people already in the tribe.

Nobody should need your entire history with a system to use it safely.

That's one reason good interfaces feel obvious. They don't expose every decision the implementation is capable of
making. They expose the decisions the caller actually needs to make.

The system handles the rest.

The goal isn't to stop engineers from making decisions. It's to stop asking them to repeatedly make decisions the system
already knows the answer to.

Documentation still matters. Comments still matter. Runbooks still matter. There will always be context worth preserving
that can't — and shouldn't — be encoded into an interface.

But when a rule is important, stable, and enforceable, it's worth asking whether explaining it is enough.

Sometimes the best documentation is the documentation nobody needs, because the system already made the wrong thing hard
to do.
