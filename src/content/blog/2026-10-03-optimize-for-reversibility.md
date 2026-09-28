---
title: Optimize for Reversibility
description: We don't always know the right decision when we make it. Good engineering leaves room to learn, change direction, and recover without rebuilding everything around us.
draft: true
coverImage: ../../assets/covers/make-the-wrong-thing-hard-to-do.jpg
coverImageAlt: TBD
tableOfContents: false
section: Process
tags:
  - software
  - development
  - design
  - architecture
---

During my time at AWS, I heard decisions described as _one-way doors_ and _two-way doors_. The idea comes from Amazon's
way of distinguishing consequential, difficult-to-reverse decisions from decisions that are easier to change.

Jeff Bezos described them as Type 1 and Type 2 decisions in his
[2015 letter to Amazon shareholders](https://www.sec.gov/Archives/edgar/data/1018724/000119312516530910/d168744dex991.htm).

A two-way door is a decision you can walk back through. If you're wrong, you learn something, reverse course, and try
something else.

A one-way door is different. Once you walk through it, reversing the decision is difficult, expensive, or sometimes
impossible.

There's another phrase I've heard throughout my career that describes essentially the same idea in less polished terms:

**Don't code yourself into a corner.**

Software engineering is full of decisions we make before we have all the information we'd like. We choose an API, a data
model, a dependency, an abstraction, or an architecture based on what we know today. Sometimes we're right. Sometimes
six months of production traffic teaches us something the design document couldn't.

I've found that some of the most painful engineering decisions aren't necessarily the ones that were wrong. They're the
ones that became difficult to change before we had enough information to know whether they were right.

The goal isn't to predict the future perfectly.

It's to make sure being wrong doesn't have to be catastrophic.

## Most Decisions Don't Need to Be Permanent

Engineers are often rewarded for making decisions. We evaluate options, discuss tradeoffs, choose a direction, and start
building. At some point, continued debate costs more than making a reasonable choice and learning from it.

The problem starts when making a decision also makes it unnecessarily difficult to reverse.

Suppose an application needs to store some data. We could hide the storage mechanism behind a small interface:

```python
class UserRepository(Protocol):
    def get(self, user_id: str) -> User | None:
        ...

    def save(self, user: User) -> None:
        ...
```

Or the rest of the application could talk to the database directly:

```python
user = dynamodb.get_item(
    TableName="users",
    Key={"id": {"S": user_id}},
)
```

There's nothing inherently wrong with using DynamoDB directly. The difference is how much of the system has learned
about that decision.

Look at what this one caller now knows: the table name, the key schema, and DynamoDB's attribute-type encoding (that
`"S"` means string). Multiply that by every place in the application that needs a user, and the decision stops being "we
use DynamoDB." It becomes "the application is structured around DynamoDB." Changing the storage model later means
finding and changing every one of those places.

Choosing DynamoDB was an easy decision to make.

Structuring the whole application around it is a much harder one to undo.

## Reversibility Is About the Cost of Being Wrong

It's tempting to think of reversible design as predicting what might change. Maybe we'll switch databases. Maybe we'll
replace this API. Maybe we'll need another implementation someday. Follow that thinking far enough and you end up
building abstractions for futures that never arrive.

I've fallen into that trap too. It's easy to justify another abstraction by imagining all the ways the system _could_
change. Given enough imagination, almost anything can look like it needs an escape hatch.

That's not the goal.

Reversibility isn't about preparing for every possible future. It's about paying attention to the decisions where being
wrong would be unusually expensive.

| Easier to reverse                                | Harder to reverse                                        |
| ------------------------------------------------ | -------------------------------------------------------- |
| A small internal function                        | A data format written into millions of persisted records |
| A library used behind one interface              | A library whose types appear throughout the codebase     |
| An internal API that can evolve with its callers | A public API used by people you don't control            |

The important question isn't _"Could this ever change?"_ Almost everything could.

A better question is _"If we're wrong, how difficult will this be to change?"_

That changes how much engineering the decision deserves.

## Keep Decisions Local

One of the simplest ways to preserve reversibility is to limit how far a decision can spread. If ten modules know which
HTTP client you chose, replacing it is a ten-module problem. If one module knows and the rest of the application talks
to that module, the same change might be a one-module problem.

This doesn't require turning every dependency into an elaborate abstraction. Sometimes it's just a function:

```python
def fetch_customer(customer_id: str) -> Customer:
    response = requests.get(f"{BASE_URL}/customers/{customer_id}", timeout=5)
    response.raise_for_status()
    return Customer.from_dict(response.json())
```

The caller doesn't need to know whether this uses REST, GraphQL, a database, a cache, or something else entirely. Swap
`requests` for another client and the caller doesn't need to change. Even a larger change, like REST to GraphQL, stays
contained behind the same boundary.

That's also why the `UserRepository` above doesn't have to be a heavyweight pattern. The interface isn't the point.
Keeping the DynamoDB-specific knowledge in one place is.

I've found this a useful way to think about coupling. The problem isn't simply that one thing depends on another.
Software has dependencies, and that's unavoidable. The question is how much of the system has to change when that
dependency changes.

A decision contained in one place is easier to reverse than one that has leaked everywhere.

## Delay the Decisions You Don't Need Yet

Sometimes the most reversible decision is the one you haven't made. That doesn't mean avoiding decisions indefinitely.
It means recognizing when the system doesn't actually require one yet.

This is something I've had to get more comfortable with over time. Making a decision can feel like progress, especially
when there's pressure to settle on an architecture. But deciding earlier isn't automatically better if all we're doing
is committing ourselves while we still know very little.

Imagine we're building a feature and know we'll need to process some work asynchronously. We could immediately choose a
queue, define a message schema, create infrastructure, build retry handling, and design around the semantics of that
particular system.

Or, if the volume doesn't require it yet, we could start much simpler while keeping the decision in one place:

```python
def submit_report(request: ReportRequest) -> None:
    # Runs inline for now. If volume demands it, this is the one place that becomes a queue.
    generate_report(request)
```

The point isn't that simple is always better. It's that every decision introduces constraints. Choosing later, when we
know more about throughput, failure modes, ordering requirements, and operational behavior, can be better than making a
sophisticated decision early based mostly on guesses.

Information has value. If waiting for more of it is cheap, preserving the option to wait can be valuable too.

## Prefer Experiments With Exits

There are times when we genuinely don't know which approach will work. That's a good time to think about the exit before
thinking about the commitment.

- Can we try the new dependency in one service before making it the standard everywhere?
- Can we put the new implementation behind a feature flag?
- Can we migrate a small percentage of traffic first?
- Can we write the new data format alongside the old one before depending on it exclusively?
- Can we measure the result before removing the previous path?

None of these techniques guarantee the experiment will work. That's the point. They reduce the cost when it doesn't.

I like experiments where failure leaves us with information instead of cleanup. If an idea doesn't work, we should be
able to say, "Well, we learned something," rather than, "Now we have six months of migration work."

A good experiment doesn't just make it possible to try something.

It makes it possible to stop trying it.

## Some Doors Really Are One-Way

Not every decision can remain reversible. Eventually data gets persisted. APIs get published. Customers depend on
behavior. Infrastructure accumulates state. Teams build systems on top of the choices we've made.

Sometimes the one-way door is unavoidable, and that should change how we approach the decision. A choice that's cheap to
reverse can usually be made quickly with incomplete information, because we can rely on feedback to correct us. A choice
that's expensive to reverse deserves more scrutiny before we commit. That might mean more design work, a prototype, a
migration plan, compatibility guarantees, or simply spending more time understanding the consequences.

The mistake isn't making irreversible decisions. Software would never ship if we refused to make them.

The mistake is treating every decision as though it has the same cost of being wrong.

## Reversibility Has a Cost Too

There's an obvious trap here. If every decision needs an interface, adapter, feature flag, migration layer,
compatibility shim, and fallback implementation, we've created another kind of problem: we've made the system
complicated today to protect ourselves from every imaginable tomorrow.

That's not reversibility.

That's fear of commitment.

An abstraction nobody needs has a maintenance cost. A feature flag nobody removes becomes another execution path. A
compatibility layer can outlive the system it was supposed to help migrate.

I've found this is where "keep our options open" can become an excuse for complexity. Flexibility sounds universally
good until you're maintaining five different paths through a system because nobody ever wanted to close a door.

Sometimes the correct decision really is to choose something and build around it. Optimizing for reversibility doesn't
mean maximizing flexibility. It means preserving flexibility where uncertainty and the cost of change justify it.

## Constrain What You Understand, Keep Open What You Don't

There's an interesting tension here with another principle I care about: making the wrong thing hard to do. If we encode
rules into types, APIs, defaults, and automation, aren't we making the system less flexible?

Sometimes. And that's exactly what we want when we understand the rule. If a resource must always have an owner, making
`owner` required removes a state we know is invalid. But if we're still discovering what ownership means, encoding a
complicated ownership model throughout the entire system might be premature.

The difference is confidence.

When we understand an invariant, constraints make the system safer. When we're still exploring a decision, reversibility
gives us room to learn.

I don't think those ideas compete with each other. They're answers to different levels of certainty. Encode what you
know. Leave yourself room around what you don't.

Good engineering requires knowing which situation you're in.

## Leave Yourself a Way Back

We make software decisions with incomplete information. Requirements change. Traffic behaves differently than expected.
Dependencies disappoint us. Customers use features in ways we didn't anticipate. Something that looked elegant on a
whiteboard turns out to be awkward in production.

None of that means the original decision was bad. It means we learned something.

The systems that age well aren't necessarily the ones where engineers predicted every future requirement correctly.
They're often the ones where learning something new doesn't require tearing everything apart.

Keep uncertain decisions local. Delay commitments when waiting gives you useful information. Experiment in ways that
give you an exit. Spend more time on the doors that really do lock behind you.

And when you're deciding how much flexibility a design needs, ask a simple question:

**If we're wrong, how hard will it be to change our mind?**

You don't need to predict every turn the software will take.

Just try not to code yourself into a corner.
