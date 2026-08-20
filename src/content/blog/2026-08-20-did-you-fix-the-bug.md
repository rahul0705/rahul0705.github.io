---
title: Did You Fix the Bug—or Just Move It?
description: A passing test proves the symptom is gone, not that the work is done. Isolate the change that mattered before adding it to the system.
coverImage: ../../assets/covers/did-you-fix-the-bug.jpg
tableOfContents: false
section: Process
tags:
  - software
  - development
  - debugging
---

The bug is gone, but you are not entirely sure why.

You changed three things while chasing it—a timeout, a cache, maybe a suspicious query—and somewhere in that sequence
the failure stopped happening. The instinct is to clean up the diff and open it for review because the system now does
what you wanted. That instinct is usually premature. A working system and an understood system are not the same thing.
Treating the first as proof of the second is how unnecessary risk enters a codebase.

Say you have a headache. You take an aspirin, drink a glass of water, and step out of a bright room. Ten minutes later,
it is gone. You do not know which action helped—or whether the headache was already fading. That uncertainty is harmless
enough in daily life. Next time, you may repeat the whole ritual. A codebase does not get the same courtesy.

The software equivalent of “drink more water next time” might be a cache left in production, adding a failure mode to a
problem it never actually solved. The headache remedy leaves almost no lasting complexity: rinse the glass, put it away,
and you are done. A cache becomes part of the system. It needs an invalidation policy, capacity limits, monitoring, and
failure handling, and every future change to the underlying data must preserve its correctness. That is an ongoing cost
for a benefit you never established—and one more component a teammate has to understand without knowing why it exists.

_(This started as a short section in a piece on_ [_code review_](/blog/2018-10-08-peer-reviews/) _— it turned out to be
less about review and more about how debugging itself ends, so it gets its own space here.)_

## Why "it works now" isn't proof

Development is exploratory by nature. You form a hypothesis, make a change, and check whether the problem is gone. It
usually isn't, not entirely, so you make another change, and another. By the time the symptom disappears, you are often
looking at three or four edits made under time pressure, in a system whose behavior you were still learning as you went.

The trouble is that "the symptom is gone" can be true for reasons that have nothing to do with your diagnosis:

- **A later change masks an earlier one.** A longer timeout does not fix a slow call — it just gives the slow call more
  room before it becomes visible again.
- **A change alters timing rather than removing a defect.** A race condition can disappear for thousands of runs because
  a delay shifted a window, not because the underlying conflict was resolved.
- **The failure was flaky to begin with.** If something only reproduces some fraction of the time, a run that happens to
  pass after your change is not strong evidence on its own — it may have passed anyway.
- **You fixed a different problem than the one you started with.** It is common to notice and correct something real —
  an unrelated null check, a genuinely redundant call — while the original root cause is still sitting there, simply
  less likely to trigger today.

None of these are hypothetical edge cases. They are the normal output of exploratory debugging, and they are exactly why
"it passes now" deserves a second look before it becomes a change description.

## What shipping the whole pile costs

Submitting every accumulated change because the combination works has three costs, and none of them show up immediately.

The first is to the reviewer. A diff that mixes an essential fix with incidental changes gives them no way to tell which
lines matter. They either approve the whole thing on faith or spend their attention re-deriving what you already knew
and then forgot to write down.

The second is operational. Every change you keep — needed or not — carries its own risk surface. A cache you didn't need
still needs invalidating correctly. A longer timeout you didn't need still changes how long a caller waits before the
system reports a problem. Unneeded changes are not neutral; they are risk you didn't bother to notice.

The third cost is to you. Knowing that a set of changes makes the symptom go away is not the same as knowing why. The
next time something in that area misbehaves — maybe with a slightly different trigger — a vague memory of "we changed
the timeout, the cache, and a query" is much less useful than knowing precisely which one mattered and which two were
noise.

## Get a stable signal before changing anything else

At this point, the problem is solved only in the sense that matters least: with all three changes applied, the system
does not fail. Treat that as a snapshot—a known-good state, not yet a known-good _explanation_. Now move backward from
it, piece by piece, to learn which edits are load-bearing.

Doing that safely requires a repeatable signal: a failing test, a script, or a measurement you can rerun and trust. “It
feels fine now” is not enough. Each step backward needs a result you can compare with the one before it.

If the failure is deterministic, this is usually just a matter of writing the test you should have started with. If it
is intermittent, get a baseline reproduction rate instead — "fails roughly six times in ten under this load pattern" —
so a change that shifts the rate to one in ten is visibly different from a change that eliminates it. Not every race
condition can be made to fail on command, but almost every one can be characterized well enough to compare before and
after.

This is close to what `git bisect` does, but inverted. `git bisect` starts from a commit you know is bad and a commit
you know is good, and searches the history between them by testing points in between until it finds the exact commit
where behavior flipped. You have the same two endpoints here — a known-bad baseline, from before you started debugging,
and a known-good snapshot, the working tree in front of you right now — but the space between them isn't a line of
commits to search. It's a set of simultaneous, still-uncommitted edits. Instead of bisecting history, you're testing
combinations of those edits against the same two endpoints to find out which ones are actually load-bearing.

## Reduce toward the minimal change

With a stable signal in hand, the process is mechanical, if not always fast:

- Return to the known-bad baseline — revert the experimental changes, or note the commit before you started.
- Reintroduce them deliberately, one at a time or in the smallest combinations that make sense, rerunning the signal
  after each.
- For each result, ask whether the symptom is _gone_ or merely _less likely_. A reduced failure rate under a changed
  timeout is a hint you are looking at a mask, not a fix.
- Watch for a change that solves something real but unrelated to the original symptom — keep it, but treat it as a
  separate fix, not evidence for the others.

The output is usually smaller than what you started with, sometimes dramatically so. It is common to find that one
change was the entire fix, one was a genuine but separate improvement, and one did nothing detectable at all.

## A worked example

Say an account summary endpoint occasionally times out under load.

```plain
def get_account_summary(account_id):
    account = account_repo.get(account_id)
    recent_orders = order_repo.get_recent(account_id)
    # order_repo.get_recent already loads pending orders internally;
    # this second call repeats that work.
    pending_orders = order_repo.get_recent(account_id, status="pending")
    return build_summary(account, recent_orders, pending_orders)
```

A load test against this baseline fails: p99 latency around 2.4 seconds, with roughly 4% of requests timing out. While
investigating, you try three things, keeping each change if it seems to help.

**First**, the client timeout looks tight for a call that touches two repositories, so you raise it:

```plain
TIMEOUT_SECONDS = 10  # was 2
```

The requests stop timing out, but the load test still misses its latency target. This bought room, not speed.

**Second**, suspecting the account lookup is the slow part, you add a cache in front of it:

```plain
@cache.memoize(ttl=30)
def get_account(account_id):
    return account_repo.get(account_id)

def get_account_summary(account_id):
    account = get_account(account_id)
    recent_orders = order_repo.get_recent(account_id)
    pending_orders = order_repo.get_recent(account_id, status="pending")
    return build_summary(account, recent_orders, pending_orders)
```

The load test improves but still misses its target. Cache hits are fast, cache misses are not, and the duplicated order
query still runs on every request.

**Third**, you notice `order_repo.get_recent` is being called twice for the same account, once for all orders and once
filtered to pending, and remove the second call:

```plain
def get_account_summary(account_id):
    account = get_account(account_id)
    recent_orders = order_repo.get_recent(account_id)
    pending_orders = [o for o in recent_orders if o.status == "pending"]
    return build_summary(account, recent_orders, pending_orders)
```

The load test passes. This is the snapshot: timeout raised, cache added, duplicate query removed, all three stacked
together, and the failure is gone.

Before writing that up as one change, go back to the known-bad baseline and test combinations of the three:

```plain
baseline (nothing changed):                  load test fails — p99 2.4s, ~4% timeout
+ timeout only:                               load test fails — no errors, still slow
+ timeout, cache:                             load test fails — fewer errors, still slow on cache misses
+ timeout, cache, no duplicate query:         load test passes  <- the snapshot

regressing from the snapshot:
  no duplicate query, cache, 2s timeout:      load test passes
  no duplicate query, 10s timeout, no cache:  load test passes
  no duplicate query alone:                   load test passes
```

Removing the duplicate query is sufficient on its own. The cache and the longer timeout can both come out:

```plain
def get_account_summary(account_id):
    account = account_repo.get(account_id)
    recent_orders = order_repo.get_recent(account_id)
    pending_orders = [o for o in recent_orders if o.status == "pending"]
    return build_summary(account, recent_orders, pending_orders)
```

What remains is a one-change diff, an obvious description, and a load test that will fail again if the duplicated call
is ever reintroduced. The cache would have added invalidation risk for a benefit that no longer existed; the longer
timeout was never solving anything — it was giving the duplicated query more room to finish before a caller gave up.

It could have gone the other way — the query removal might have helped but not been sufficient on its own, and the cache
might have turned out to be the real fix. The point of the trial log isn't to predict the answer in advance. It's that
you cannot write an honest description of what changed until you have actually isolated it.

## When you can't fully isolate it

Not every fix needs this treatment. A one-line correction to an obvious mistake does not need a reduction process to
justify itself. And some systems genuinely resist isolation — a distributed race that reproduces once a day under
production traffic is not something you can cleanly test in a loop before a review deadline.

In those cases, reduce as far as is practical and say so plainly rather than presenting a clean diff that implies more
confidence than you have. "Removed the duplicated query, which is very likely the fix; kept the longer timeout as a
hedge, since we could not reproduce the failure reliably enough to confirm it independently" tells a reviewer something
true. A diff that quietly keeps all three changes because reverting them felt risky tells them something false.

## What you keep besides the fix

The habit pays for itself beyond the current change. A test written against the specific, isolated cause is a better
regression guard than one written against the compound symptom — it will fail again for the right reason if the same
mistake is reintroduced. The change description you can now write is shorter and more honest, because it explains a
cause instead of narrating a sequence of edits. And the understanding is reusable: the next time a request in that part
of the system is slow, you will recognize the shape of the problem instead of reaching for the same three changes out of
habit — the shortcut a headache can afford and a codebase can't.

## Closing thought

A fix that works and a fix you understand are not always the same thing, and the gap is invisible in a green test suite.
It appears later—in a change nobody feels safe reverting, or a symptom that returns in a different form. Reducing a set
of working changes to what mattered takes longer than shipping the version that happens to work. It is also how you find
out, while the context is still fresh, whether you fixed the problem or merely moved it somewhere quieter.
