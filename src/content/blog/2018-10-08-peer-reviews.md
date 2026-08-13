---
title: Code Reviews
featured: true
description: A living guide to reviewing code with clarity, consistency, and constructive feedback.
updatedDate: 2026-08-12
coverImage: ../../assets/covers/review.jpg
section: Process
tags:
  - software
  - development
  - code
  - review

# cSpell:ignore dataclass dataclasses gofmt mypy Pylint Clippy timedelta
---

A practical guide for reviewing code and having your code reviewed. This is a living document, so expect it to change
and evolve over time.

The ideas below are prompts, not gates that every change must pass. Different systems, teams, and situations call for
different tradeoffs. A small documentation fix does not need the same scrutiny as an authentication change, and a
prototype should not be held to every standard of a safety-critical production service. The purpose of a review is to
apply engineering judgment, share context, and make the change better—not to enforce personal preferences.

This guide covers both sides of that conversation:

- [Reviewing someone else's code](#reviewing-code) offers prompts for evaluating behavior, design, risk, tests, and
  feedback.
- [Having your code reviewed](#having-your-code-reviewed) covers preparing, explaining, and submitting a focused change.

## The goal of a code review

A code review should help the team answer a few broad questions:

- Does the change solve the intended problem?
- Is the behavior understandable and maintainable?
- Does it introduce risks that the author may not have considered?
- Is there enough evidence to be confident in the change?
- Will the next person be able to support it?

Reviews also spread knowledge. A useful review can teach the reviewer about a part of the system, give the author a new
way to approach a problem, and prevent important design context from living with only one person.

Before commenting on individual lines, understand the purpose and scope of the change. Read the issue, description, or
design notes. Look at the tests and the surrounding code. If the intent is unclear, asking for context is often more
helpful than assuming the implementation is wrong.

## Reviewing code

The order in which you review can matter. Start with behavior and architecture before spending time on naming or
formatting. There is little value in polishing code that needs to be redesigned. Better yet, outsource formatting and
other mechanical checks to tooling whenever possible so neither the author nor reviewer needs to spend time enforcing
them manually.

### Correctness and behavior

#### Does the change satisfy its intent?

Follow the main path through the code and compare it with the problem being solved. Consider whether the implementation
matches the expected behavior rather than only whether it compiles.

Some questions that may help:

- What happens with empty, missing, duplicate, or malformed input?
- Are boundary values handled correctly?
- Can operations occur in an unexpected order?
- What happens when a dependency is slow or unavailable?
- Could retries repeat an operation that should happen only once?
- Does the change preserve existing behavior that callers depend on?

Not every change needs to handle every hypothetical condition. The reviewer can help distinguish a realistic failure
mode from an edge case that would add complexity without meaningful benefit.

For example, if a message can be delivered more than once, a reviewer might ask whether the operation should be
idempotent rather than simply asking for another conditional:

```python
def handle_payment(message):
    if payment_store.contains(message.payment_id):
        return

    payment_store.record(message.payment_id, message.amount)
```

This example is intentionally incomplete: in a concurrent system, the check and record may need to be one atomic
operation. The example gives the reviewer and author something concrete to discuss instead of implying there is one
universal fix.

#### Are failures handled at the right level?

Look at how errors are detected, represented, logged, and returned. Swallowing an error can make a failure difficult to
diagnose, while catching and wrapping every error can hide useful details or create noise. Consider whether the code
leaves the system in a valid state after a partial failure.

For user-facing or operational systems, it can also be useful to ask whether an operator will have enough information
to understand what failed without exposing secrets or sensitive data.

### Design and maintainability

#### Is the change at the right level of abstraction?

Consider whether the new behavior belongs in the component being modified. A function can work correctly and still
make the system harder to maintain if it introduces a dependency in the wrong direction or gives one component too many
responsibilities.

Look for opportunities to keep domain logic separate from transport, storage, framework, and presentation concerns.
This is not a requirement to add layers; sometimes a direct implementation is the clearest choice.

#### Is the code easy to follow?

Try to read the change as someone who did not write it. Names should communicate intent, and the control flow should
make the important behavior apparent. Comments are most valuable when they explain _why_ a decision was made, a
constraint exists, or an unusual approach is necessary. Comments that simply restate the code can become stale.

For example, this comment adds no information beyond the next line:

```python
# Wait five seconds before retrying.
time.sleep(5)
```

If the implementation later changes to exponential backoff but the comment is overlooked, the comment becomes actively
misleading:

```python
# Wait five seconds before retrying.
time.sleep(exponential_backoff(attempt))
```

A useful comment explains the reason for the delay—a constraint that is less likely to change with the implementation:

```python
# Spread retries out so synchronized clients do not overwhelm a recovering dependency.
time.sleep(jittered_backoff(attempt))
```

The function and variable names describe _what_ the code does. The comment preserves _why_ the behavior matters. If the
reason is already clear from the surrounding code and domain language, no comment may be necessary.

#### Do names make the computation understandable?

Names are part of the design. A function name should describe the operation or outcome at the caller's level, while a
variable name should identify what a value represents—not merely its type or where it came from. Predicates often read
clearly as questions such as `is_expired`, `has_permission`, or `can_retry`.

Intermediate variables can turn a dense expression into a sequence of named decisions. For example:

```python
def order_total(subtotal, discount_rate, shipping, tax_rate):
    return (subtotal - subtotal * discount_rate + shipping) * (1 + tax_rate)
```

The formula is compact, but a reader must reconstruct what is discounted, what is taxed, and which order the operations
follow. Naming each meaningful step makes those decisions visible:

```python
def order_total(subtotal, discount_rate, shipping, tax_rate):
    discount_amount = subtotal * discount_rate
    discounted_subtotal = subtotal - discount_amount
    taxable_amount = discounted_subtotal + shipping
    tax_amount = taxable_amount * tax_rate

    return taxable_amount + tax_amount
```

This version also gives a reviewer specific questions to ask: Should shipping be taxable? Should the discount apply to
shipping? Those rules were present in the one-line expression, but the names make them easier to see and test.

Not every operator needs its own variable. Add names where they reveal a domain concept, boundary, or meaningful stage
of a computation. Temporary names such as `value2`, `temp`, or `result` can add lines without adding understanding.

The same principle applies to functions. `calculate_order_total` communicates more than `process`, while a smaller
function such as `calculate_tax(taxable_amount, tax_rate)` may be valuable when tax calculation is an independent rule.
Avoid extracting a function solely to shorten another function; extract it when the name and boundary make the behavior
clearer or the rule genuinely needs to be reused or tested independently.

Complexity is not only the number of lines. Indirection, generic abstractions, hidden side effects, and configuration
spread across several files can all make a small change difficult to understand.

#### Is repeated code expressing the same rule?

Is there repeated logic that could be factored into a helper function? Extracting relevant shared behavior can reduce
the number of places where bugs can appear and the number of locations that need to change when the behavior evolves.

DRY is a prompt, not an instruction to remove every repeated line. Two pieces of code that look similar today may
represent different concepts and change for different reasons. An abstraction that combines them too early can create
more coupling than the duplication it removes. Ask whether the repeated code represents the same rule before sharing
it.

When the duplication does represent one rule, extracting it can give that rule a name and a single place to evolve:

```python
def publish_report(report):
    visibility = "public" if report.is_public else "private"
    # Publish the report using visibility.


def archive_report(report):
    visibility = "public" if report.is_public else "private"
    # Archive the report using visibility.
```

Could become:

```python
def report_visibility(report):
    return "public" if report.is_public else "private"


def publish_report(report):
    visibility = report_visibility(report)
    # Publish the report using visibility.


def archive_report(report):
    visibility = report_visibility(report)
    # Archive the report using visibility.
```

#### Could the abstraction create unintended coupling?

Collapsing things that look alike can accidentally declare that they _are_ alike and must evolve together. A useful
analogy is:

> It has four legs, two ears, and whiskers, so it must be a dog. Except those traits could describe a cat, a lion, a
> wolf, or many other animals. Shared appearance is not the same as shared identity or behavior.

The same risk exists in code. Two models may have the same fields today without representing the same concept:

```python
from dataclasses import dataclass


@dataclass
class ShippingAddress:
    street: str
    city: str
    postal_code: str


@dataclass
class BillingAddress:
    street: str
    city: str
    postal_code: str
```

It may be tempting to replace both with a single `Address` model. That could be appropriate if the domain treats them
as the same value. It could also couple unrelated concepts: a shipping address may later need delivery instructions,
while a billing address may need tax jurisdiction or verification status.

Repeating a small model, function, or block of code can be a deliberate way to preserve independence. Consider sharing
code when the concepts follow the same business rule and should change together—not only because their current shapes
match. Duplication is a cost, but coupling is also a cost.

#### Does the code exit early?

Early returns can keep the primary path from being buried in nested conditions. This is usually a readability benefit
more than a performance optimization.

```python
def func(items):
    if items:
        for item in items:
            print(item)
```

May be easier to scan as:

```python
def func(items):
    if not items:
        return

    for item in items:
        print(item)
```

Early exits are not automatically better. A function with many return points can make cleanup or state changes harder
to reason about. The useful question is which structure makes the behavior clearest.

#### Are the returns simple?

Sometimes it is best to let the language express the result directly. Instead of checking a condition and explicitly
returning `True` or `False`, returning the condition can be clearer.

```python
def item_exists(x, items):
    if x in items:
        return True
    return False
```

Can become:

```python
def item_exists(x, items):
    return x in items
```

#### Is there unused code?

Code has a maintenance cost even when it is not executed. Keep an eye out for:

- Commented-out code
- Empty methods
- Unused variables
- Outdated comments
- Leftover imports
- Feature flags or compatibility paths that are no longer needed

Linters and compilers can identify many of these automatically. Review time is better spent on issues that require
context, so prefer automation where it is practical.

It is important to distinguish empty methods from intentional stubs or extension points. A stub can be useful early in a
project or as part of an interface, but its purpose should be clear.

#### Does the code depend on more than it needs?

This is sometimes described as _shy code_: code that does not know about or interact with more of the system than
necessary. Variables, functions, modules, and permissions can start with the smallest useful scope and expand when
there is a concrete need. This can make behavior easier to test and reduce unintended coupling.

#### Are there hard-coded values?

When you see a hard-coded value, ask what the value represents and how often it is expected to change. A named constant
can clarify a business rule. Configuration may be appropriate when operators or environments need to change the value.

Not every literal needs to become configuration. Making a value configurable introduces another interface to document,
validate, test, and support. Prefer configuration when there is a real variation point rather than because a value is
technically static.

For example, naming a business rule can improve the code without creating a new runtime setting:

```python
MAX_LOGIN_ATTEMPTS = 5

if failed_attempts >= MAX_LOGIN_ATTEMPTS:
    lock_account()
```

If different deployments genuinely require different limits, configuration may make sense. If the value is a fixed
security policy, a named and tested constant may be the better representation.

#### Does it follow the style guide and coding conventions?

Consistent conventions reduce the effort required to read unfamiliar code. If the team has a style guide, consider
whether the change follows it. If it does not, determine whether the difference is intentional or whether the convention
itself should evolve.

Formatting and other mechanical conventions should be automated whenever practical. A reviewer can then focus on
design and behavior instead of acting as a linter. Common examples include:

- **Formatters:** Prettier for JavaScript, TypeScript, JSON, CSS, and Markdown; Black or Ruff's formatter for Python;
  `gofmt` for Go; and `rustfmt` for Rust.
- **Linters:** ESLint or Oxlint for JavaScript and TypeScript; Ruff, Flake8, or Pylint for Python; Clippy for Rust; and
  language-specific static-analysis tools.
- **Type and compile checks:** TypeScript, mypy or Pyright, compiler warnings, and schema validation.
- **Repository checks:** pre-commit hooks, changed-file checks, generated-file validation, spelling checks, and secret
  scanning.
- **Continuous integration:** run the agreed formatter, linter, type checker, tests, and build for every proposed
  change.

Tooling should produce the same result locally and in continuous integration. If a formatter can fix an issue
deterministically, the team should generally let it do so rather than debating the result in review. Reviewers may still
comment when a technically valid name hides intent or when generated output reveals a deeper problem; those require
context that a formatter cannot provide.

If your team does not have a guide, there are many useful examples [online](https://github.com/google/styleguide), but a
small automated standard that the team consistently follows is usually more valuable than a large document nobody can
remember.

#### Has the relevant documentation changed with the code?

Documentation is part of the interface a change presents to users, operators, and other developers. Consider whether
the change also requires updates to:

- Public API or library documentation
- Configuration references and example files
- Operational procedures, dashboards, alerts, or runbooks
- Tutorials, commands, screenshots, or sample requests and responses
- Upgrade, migration, deprecation, or rollback instructions

Documentation should explain the behavior and decisions a reader needs to use or support the change. It does not need
to narrate the implementation. When code and documentation must change together, reviewing both in the same change can
make inconsistencies easier to catch.

### Operational and security considerations

The relevance of these areas depends on the change, but they are worth considering when code handles production data,
external input, concurrency, or shared infrastructure.

#### Are inputs and permissions appropriately constrained?

Consider where input comes from and whether it is validated at an appropriate boundary. Look for injection risks,
unsafe deserialization, path manipulation, or assumptions about trusted callers. Check that the change grants only the
permissions it needs and does not expose credentials, personal information, or internal details through responses and
logs.

#### Could concurrency or state create surprises?

Code that reads and then writes shared state may behave differently when two requests run at the same time. Consider
whether operations need to be atomic, idempotent, ordered, or protected from duplicate delivery.

#### Will the change be observable in production?

For important workflows, ask how the team will know the feature is working and how they will diagnose a failure. Useful
logs, metrics, traces, and error messages should describe outcomes without adding excessive noise or sensitive data.

Also consider how the change will be deployed and reversed. Is a rollback still safe after the new version writes data,
changes a schema, or enables new behavior? Does reverting the application also require reverting configuration,
infrastructure, or a migration? A change does not always need an elaborate rollback plan, but the recovery path should
be proportionate to its operational risk.

#### Is the performance appropriate for the expected scale?

Look for unnecessary work in frequently executed paths, unbounded collections, repeated network calls, or queries made
inside loops. Performance feedback is most useful when connected to expected usage or measurements. Avoid making code
more complex for a theoretical optimization that the system does not need.

### Tests

Tests provide evidence, not certainty. The useful question is whether the level and type of testing are proportional to
the risk of the change.

#### Do the tests demonstrate the intended behavior?

Good tests communicate what the code promises to do. Consider whether they cover the important success path, meaningful
boundaries, and realistic failure modes. Tests that only mirror the implementation can remain green while the intended
behavior is broken.

A test should help answer questions about what the code _does_: What happens at the boundary? What happens immediately
before and after it? What outcome should a caller observe when an input is empty, duplicated, delayed, or invalid? A
good test should usually remain useful if the implementation is rewritten without changing its behavior.

Implementation often depends on assumptions and constraints that are easy to forget once the code works. If those
conditions are important to the behavior, capture them in tests. The test then provides an early warning when a future
change crosses the boundary or quietly invalidates an assumption.

Suppose a discount applies to orders of $100 or more, discounts cannot exceed the order total, and negative totals are
invalid. Those are behavioral decisions worth preserving explicitly:

```python
def test_discount_starts_at_one_hundred_dollars():
    assert discount_for(99) == 0
    assert discount_for(100) == 10


def test_discount_never_exceeds_the_order_total():
    assert discount_for(5) == 0


def test_negative_order_total_is_rejected():
    with pytest.raises(ValueError):
        discount_for(-1)
```

These tests do not need to know whether `discount_for` uses conditionals, a lookup table, or a policy object. They hold
the externally meaningful boundaries steady. If the business later decides the threshold should be $75, the failing
test makes that behavior change visible and requires the team to update the expectation deliberately.

Not every implementation detail is a constraint. Avoid freezing private call order, temporary data structures, or the
exact number of helper calls unless those details are themselves part of a required contract. The objective is to
protect behavior and intentional limitations without making safe refactoring unnecessarily difficult.

#### Is new behavior accompanied by appropriate tests?

Code volume does not determine the testing need. A small configuration change can alter important behavior, while a
large mechanical refactor may not require many new expectations. Ask whether new or changed behavior is accompanied by
tests at the level that provides useful confidence. Existing tests may also need to change when an intentional behavior
or constraint changes.

Unit tests are especially useful for business rules, transformations, and error handling that can be exercised in
isolation.

For example, a table-driven test can show the important boundaries more clearly than several tests that repeat the same
setup:

```python
@pytest.mark.parametrize(
    ("failed_attempts", "should_lock"),
    [(0, False), (4, False), (5, True), (6, True)],
)
def test_account_lock_boundary(failed_attempts, should_lock):
    assert should_lock_account(failed_attempts) is should_lock
```

#### Would an integration or end-to-end test add confidence?

Testing code in isolation does not verify that components agree on schemas, configuration, protocols, or lifecycle.
Integration tests can cover those boundaries, while a small number of end-to-end tests can demonstrate that critical
user workflows function as a whole.

Also consider what should _not_ be tested. A test that is expensive, flaky, or coupled to implementation details can
slow the team without adding much confidence.

### Giving useful feedback

Review comments should make their intent and importance clear. A question or suggestion often invites a better
conversation than a command, especially when several solutions could work.

For example:

- **Question:** "What should happen if this request is delivered twice?"
- **Suggestion:** "Would an early return make the successful path easier to follow here?"
- **Concern:** "This value comes from the request and is used in a file path. Could we validate it before use?"
- **Context:** "This service is also called by the nightly import, which can send an empty collection."

Explain the reason behind a comment when it is not obvious. "Rename this" gives the author less information than "A
name that describes the retry limit would help distinguish this value from the request timeout below."

It can also help to separate blocking concerns from optional improvements. Not every good idea needs to delay the
current change. If a comment is a preference, say so. If it identifies a correctness or security issue, explain the
impact clearly.

Avoid using a review to redesign unrelated code. It is reasonable to mention nearby improvements, but keeping the
requested change focused makes it easier to review, test, and deliver.

Do not approve a consequential change merely because nothing obviously looks wrong. If an important behavior,
security boundary, migration, or operational decision is outside your understanding, ask for context or involve a
reviewer with the relevant domain expertise. Identifying where another perspective is needed is a useful review
outcome—not a failure to review.

### Completing the review cycle

A review is not complete when the first set of comments is submitted. Changes made in response to feedback can alter
assumptions, introduce new behavior, or affect code that was already reviewed. Before approval, review the resulting
change as a whole rather than looking only at the lines changed since the last pass.

Confirm that:

- New commits still satisfy the original intent and do not invalidate earlier conclusions.
- Changes made for one comment did not create a problem elsewhere in the change.
- Tests and documentation still describe the final behavior.
- Blocking concerns were addressed or a deliberate tradeoff was recorded.
- Conversations are resolved with enough context to explain the outcome, not merely dismissed because the code moved.
- Required automated checks apply to the final commit and have completed successfully.

Approval should mean that the reviewer understands the consequential parts of the final change, believes the evidence
is proportionate to its risk, and has no unresolved blocking concerns. It does not mean the reviewer guarantees the
code is perfect or would have implemented it in exactly the same way.

## Having your code reviewed

A good review begins before the reviewer is invited. The author can reduce review time and improve the quality of
feedback by presenting a change that is focused, understandable, and supported by evidence.

These suggestions are not a requirement that every change have an elaborate submission process. The amount of
preparation should be proportional to the size and risk of the work.

### Keep the change focused

Small, cohesive changes are generally easier to understand than changes that mix new behavior, unrelated refactoring,
formatting, dependency upgrades, and generated files. A focused change gives the reviewer a clearer answer to "What is
different, and why?"

This does not mean optimizing for the fewest lines. Splitting one behavior across several dependent reviews can make it
harder to understand and test. Prefer a change that is independently coherent and as small as it can reasonably be.

If cleanup is necessary before implementing the behavior, consider separating it into an earlier change. If generated
files or mechanical renames create noise, isolate them in a commit or explain how the reviewer can hide them.

### Review your own change first

Read the diff as if it belonged to someone else. This often reveals temporary debugging code, vague names, accidental
file changes, missing error handling, and comments that made sense while writing the code but do not explain the final
decision.

A useful self-review can include:

- Reading the complete diff, not only the files you remember changing
- Checking that the change matches the issue or requirement
- Removing experiments, commented-out code, and unrelated edits
- Looking at the change from a caller's or user's perspective
- Confirming that new interfaces and configuration are documented
- Considering rollback, compatibility, and migration when state or public behavior changes

### Determine what actually solved the problem

Development is often exploratory. You try change A and the problem remains. You add B and it improves but still fails.
You add C and everything works. At that point, it is tempting to perform minor cleanup and submit A + B + C because the
current state produces the desired result.

Getting something to work is not yet evidence that every accumulated change belongs in the solution. Before preparing
the review, go back and determine what actually caused the result:

- Does C solve the problem on its own?
- Is the necessary change A + C, B + C, or all three?
- Did A or B merely hide the failure, alter timing, or make the test pass accidentally?
- Did any experiment introduce behavior unrelated to the original problem?

For example, imagine diagnosing a slow request by increasing a timeout, adding a cache, and removing an unnecessary
database query. The request now completes, but that does not prove all three changes are appropriate. Revert or isolate
each experiment, rerun the relevant test or measurement, and identify which change affects the outcome. The removed
query may be the complete fix; the longer timeout may only conceal the symptom; the cache may add invalidation risk
without providing meaningful value.

This reduction step produces a more targeted review and fewer accidental side effects. It also improves the author's
understanding of the system. Knowing _why_ a change worked builds reusable debugging knowledge; remembering only the
final combination of edits does not.

Where practical, write a failing test or repeatable measurement before reducing the experiments. It gives you a stable
signal for comparing A, B, and C instead of relying on memory or a one-time observation.

### Run the automated checks

Run the same formatter, linter, type checker, tests, and build that continuous integration will run. When a check cannot
be run locally, state that clearly instead of leaving the reviewer to infer whether it was forgotten.

Automation should catch mechanical problems before review. The author is then asking reviewers to spend attention on
the decisions that require human context.

Generated and AI-assisted code has the same standard of ownership as code written manually. Authors should understand
what they submit, verify that it fits the repository and its constraints, and test its behavior. When provenance or
licensing could be relevant—such as generated code that closely follows an external implementation—confirm that the
material can be used and attributed appropriately. A tool producing plausible code is not evidence that the code is
correct, secure, or maintainable.

### Write a useful change description

The description should explain the problem and the reasoning, not narrate every changed file. A reviewer can already
read the diff; they may not know the decisions, assumptions, constraints, alternatives, or expected outcome. Those
details may not be apparent from otherwise clear code.

For example, this function shows a five-minute window but cannot explain why that window exists:

```python
from datetime import timedelta


REPLAY_WINDOW = timedelta(minutes=5)


def can_replay(event, now):
    return now - event.received_at <= REPLAY_WINDOW
```

The review description can supply the missing context: events normally arrive within one minute, the upstream service
may retry for up to five minutes, and accepting older events would conflict with an existing reconciliation job. That
lets the reviewer evaluate the decision instead of guessing whether five minutes is arbitrary.

A lightweight description might include:

```markdown
## Why

Retries can deliver the same payment event more than once, creating duplicate records.

## What changed

- Store the provider's payment ID with each record.
- Treat an existing payment ID as an already-completed operation.

## Decisions, assumptions, and constraints

- The provider guarantees that a payment ID identifies one logical payment.
- Duplicate deliveries may occur concurrently, so the check and insert share one transaction.
- We intentionally do not deduplicate by customer and amount because separate payments may have both values in common.

## How it was verified

- Added unit coverage for first delivery and duplicate delivery.
- Replayed a sanitized production-shaped event locally.

## Review notes

The transaction boundary in `record_payment` is the highest-risk part of this change.
```

For a trivial change, a sentence may be enough. For a risky migration or architectural change, link to a design record,
rollout plan, or operational procedure rather than forcing all context into the review description.

### Provide evidence appropriate to the change

Evidence can take different forms:

- Automated test results for behavioral changes
- Before-and-after screenshots or recordings for visual changes
- Measurements and test conditions for performance claims
- Example requests and responses for an API
- Migration rehearsal results for data changes
- Logs, metrics, or a dashboard showing how rollout will be observed

Avoid claiming that a change is "faster" or "fixed" without showing how that conclusion was reached. The evidence does
not need to be elaborate, but it should connect to the risk or outcome being discussed.

### Guide the reviewer's attention

Call out the areas where feedback will be most valuable: a concurrency decision, an unfamiliar API, a security
boundary, or a tradeoff between two designs. Mention files that are generated or changes that are purely mechanical.

Do not use guidance to steer reviewers away from problems. The goal is to help them build the right mental model and
spend limited attention where judgment matters most.

Do not be afraid to comment on your own review after submitting it. An author comment can point directly to an area
where you want feedback, explain why an unusual line exists, or identify a tradeoff that is easier to understand beside
the relevant code than in the overall description.

For example:

> **Author note:** I kept these models separate even though their fields currently match. Shipping and billing rules
> change independently, and I would especially like feedback on whether this boundary is clear enough.

Or:

> **Author question:** This transaction prevents concurrent duplicate inserts. Is there another caller or database
> behavior that could violate the payment-ID assumption?

Self-comments should add context or invite judgment, not explain every line. Used selectively, they make it easier for
reviewers to find the areas where their experience will add the most value.

### Responding to feedback

Treat questions as signals that the code or description may need more context, even when the implementation is correct.
Respond to comments so the reviewer knows whether the code changed, the concern was addressed elsewhere, or the team
made a deliberate tradeoff.

Authors should also feel comfortable explaining why a suggestion does not fit the constraints of the change. A review
is a technical conversation, not a contest between the author and reviewer. Disagreement can uncover assumptions that
neither person had written down.

When feedback leads to a non-obvious decision, consider capturing the reason in code, a test, documentation, or the
change description so that the next person does not need to reconstruct the same discussion.

After addressing feedback, review the complete resulting diff again. Summarize meaningful changes when they affect the
reviewer's earlier understanding, rerun the relevant checks, and avoid resolving a conversation until the outcome is
clear. If a comment no longer applies because the implementation changed, a short explanation is more useful than
silently marking it resolved.

## Closing thought

There is no universal checklist that makes a code review complete. These prompts are ways to explore a change and find
the questions that matter for its context. A successful review leaves the code clearer, the risks better understood,
and the team with more shared knowledge than it had before.
