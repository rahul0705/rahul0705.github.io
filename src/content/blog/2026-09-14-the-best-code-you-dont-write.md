---
title: The Best Code Is Sometimes the Code You Don't Write
description: Code has a cost long after it's written. Good engineering isn't just knowing how to build a solution—it's knowing when not to build one.
coverImage: ../../assets/covers/the-best-code-you-dont-write.jpg
coverImageAlt: Tattooed hands pruning a bonsai tree with small scissors
tableOfContents: false
section: Process
tags:
  - software
  - development
  - design
  - simplicity

# cSpell:ignore dataclass dataclasses dont
---

There's a satisfying moment in software development when you finally get something working. You've added the
abstraction, wired up the configuration, handled the edge cases, written the tests, and watched the build turn
green. The solution works.

But there's another question worth asking before you call it done:

**Did this problem actually need more code?**

We tend to measure engineering progress by what we add — new features, new services, new abstractions, new
configuration, new dependencies. Sometimes the better decision is to remove something, or never build it in the
first place.

## Every Line Has a Cost

Code isn't free once it's written. Every line adds to a system someone has to understand, test, review, maintain,
debug, and secure. That cost is easy to ignore because it doesn't arrive all at once.

A small helper becomes an abstraction. The abstraction gains configuration. The configuration needs validation. The
validation needs error handling. Someone has to document how it all works.

Then, six months later, another engineer runs into it while trying to fix something completely unrelated.

None of those additions are necessarily bad — complexity is often unavoidable. But complexity should be something
we _spend deliberately_, not something we accumulate by default.

## Before You Build the Solution, Challenge the Problem

When someone asks for a feature, our instinct as engineers is to figure out how to implement it. That's useful, but
it skips a question:

**Why does this need to exist?**

Imagine a service has a configurable timeout:

```python
from dataclasses import dataclass


@dataclass
class TimeoutConfig:
    timeout_ms: int
```

Someone asks for a second option so a particular workflow can use a different value. The implementation looks
straightforward:

```python
from dataclasses import dataclass


@dataclass
class TimeoutConfig:
    timeout_ms: int
    special_workflow_timeout_ms: int | None = None


def get_timeout(config: TimeoutConfig, is_special_workflow: bool) -> int:
    if is_special_workflow and config.special_workflow_timeout_ms is not None:
        return config.special_workflow_timeout_ms
    return config.timeout_ms
```

Problem solved — except now there are two values to configure, another branch to test, and a new distinction every
engineer touching this code has to understand.

The expensive part isn't the extra lines. The system now owns a new concept: a "special workflow timeout." From
this point forward, someone has to know why it exists, when it applies, and whether the next workflow that comes
along belongs in the same category.

Maybe that distinction really is necessary. Or maybe the original timeout is wrong. Or the operation shouldn't be
synchronous in the first place. Or the caller is retrying incorrectly. Or the workflow shouldn't be "special" at
all.

Adding configuration can solve the symptom while making the underlying system harder to understand.

The same pattern shows up everywhere:

- Before adding another feature flag, ask whether the behavior should just become the default.
- Before adding another abstraction, ask whether the implementations actually need to vary.
- Before adding another service, ask whether the existing boundary is really the problem.
- Before adding another dependency, ask whether the capability is worth owning indirectly.

The question isn't just _how do we implement this?_ It's also: _what would have to be true for us not to implement
this?_

That second question can lead somewhere far more interesting.

## Deleting Code Is a Feature

There's a reason removing code feels uncomfortable. A pull request that adds 500 lines looks substantial. One that
removes 500 lines can look suspiciously easy. But the two changes don't carry equal long-term cost — if both solve
the same problem, the version that leaves less behind is usually the better trade.

- Removing an obsolete compatibility layer means nobody has to understand it anymore.
- Removing configuration means fewer invalid combinations to reason about.
- Removing an abstraction means fewer places to look when debugging.
- Removing a dependency means one fewer thing that can break underneath you.
- Retiring an unused feature removes a support obligation once its users have migrated.

Deletion doesn't just shrink a repository. It reduces the number of things the system can do — and sometimes that's
exactly what makes it better.

## Don't Build for Imaginary Futures

A common source of unnecessary code is designing for possibilities instead of requirements: _we might need another
implementation later; this could eventually support multiple providers; we should make this configurable in case
someone needs to change it._

Maybe. But possible requirements branch in too many directions for us to design for all of them. Worse, the
abstraction we build today is based on our guess about tomorrow's requirements — and when those requirements
actually arrive, they're usually different. Now, instead of designing the right abstraction around two real
examples, we're bending a speculative one around a problem it was never built to solve.

Sometimes waiting is the design decision. Build what you understand today. Leave room to change it tomorrow. Those
aren't contradictory goals.

## Simplicity Isn't the Same as Doing Less

There's an important distinction between _simple_ and _incomplete_.

Not writing code because a problem doesn't need it is good engineering. Not writing code because handling the hard
cases is inconvenient isn't. You still need the authentication, validation, observability, tests, and failure
handling that the problem requires. Simplicity can't become an excuse for pushing complexity onto users, operators,
or the next engineer.

The goal isn't to minimize the number of lines in the repository. It's to minimize the _accidental_ complexity
required to solve the problem correctly. Sometimes that takes 20 lines. Sometimes it takes 2,000. And sometimes it
takes zero.

## A Useful Question for Code Review

When reviewing a change, I like to ask one question before getting into implementation details:

**What disappears if we merge this?**

Not every change needs a good answer — a new capability may genuinely add something to the system. But the question
changes how you think about the change:

- Does a new abstraction replace several special cases?
- Does a new automated check eliminate a manual process?
- Does a refactor remove an old implementation?
- Does a new default let some configuration disappear?

Or are we simply adding another layer while everything underneath it stays exactly as it was?

Good changes don't always make a codebase smaller. But ideally, they make the system simpler somewhere. If nothing
gets simpler, it's worth asking whether we're solving the right problem.

## Code Is a Liability With a Purpose

We usually talk about code as an asset — it's what we've built, our intellectual property, evidence of progress.
Operationally, though, it behaves more like a liability: it needs maintenance, accumulates dependencies, contains
bugs, creates attack surface, and consumes attention.

We accept those costs because the code provides something valuable in return. That's the trade.

The goal was never to write as little code as possible. It's to make sure the code — and the complexity — we choose
to own is earning its keep.

The best engineers I've worked with aren't necessarily the ones who can build the most elaborate solution. They're
the ones willing to ask whether the elaborate solution needs to exist at all — because sometimes the cleanest
abstraction is no abstraction, the best configuration option is a sensible default, and the best dependency is the
one you remove.

And sometimes the best code is the code you don't write.
