---
title: Duplication Is Cheaper Than the Wrong Abstraction
description: DRY reduces repetition, but the wrong abstraction couples concepts that should be free to change independently.
publishedDate: 2026-08-17
featured: true
coverImage: ../../assets/covers/duplication-vs-coupling.jpg
coverImageAlt: Railway tracks converging and separating across a rural junction
section: Process
tags:
  - software
  - development
  - design
  - refactoring

# cSpell:ignore dataclass dataclasses
---

Don't repeat yourself—DRY—is useful advice when repetition means the same knowledge is scattered across a system. It
is less useful when applied as a rule that every similar-looking block of code must share an implementation.

Two pieces of code can look alike without representing the same idea. Combining them removes visible duplication, but
it also creates a relationship: both callers must now depend on the same names, inputs, behavior, and release cycle.
If that relationship is not real, the abstraction becomes a negotiation between unrelated requirements.

That is the tradeoff behind the phrase:

> Duplication is cheaper than the wrong abstraction.

Collapsing things that look alike can accidentally declare that they _are_ alike and must evolve together. A useful
analogy is:

> It has four legs, two ears, and whiskers, so it must be a dog. Except those traits could describe a cat, a lion, a
> wolf, or many other animals. Shared appearance is not the same as shared identity or behavior.

Code presents the same trap. A matching set of fields, steps, or function signatures can be evidence of a shared
concept, but it can also be a temporary resemblance between things with different responsibilities.

Duplication has an obvious cost. A change may need to be made in more than one place. The cost of the wrong abstraction
is quieter: conditionals accumulate, parameters lose meaning, callers work around behavior they do not need, and a
small change for one use case risks breaking another.

The goal is not to prefer duplication. It is to decide which code should change together and which code should remain
free to change independently. The governing question is not “Can these lines be combined?” It is “Should these concepts
change together?”

## DRY is about knowledge, not text

The strongest reason to remove duplication is not that two blocks contain the same characters. It is that they encode
the same decision.

Suppose two workflows calculate sales tax using the same business policy:

```python
def checkout_total(subtotal, tax_rate):
    tax = round(subtotal * tax_rate, 2)
    return subtotal + tax


def invoice_total(subtotal, tax_rate):
    tax = round(subtotal * tax_rate, 2)
    return subtotal + tax
```

If the organization has one rule for calculating tax, leaving that rule in two places is risky. One workflow might
change its rounding behavior while the other does not. Extracting the rule gives it a name and one place to evolve:

```python
def calculate_tax(subtotal, tax_rate):
    return round(subtotal * tax_rate, 2)


def checkout_total(subtotal, tax_rate):
    return subtotal + calculate_tax(subtotal, tax_rate)


def invoice_total(subtotal, tax_rate):
    return subtotal + calculate_tax(subtotal, tax_rate)
```

This abstraction is valuable because the dependency already exists in the domain. Both workflows are meant to follow
the same tax policy. The shared function makes that relationship explicit.

But that relationship is a domain decision, not a permanent consequence of the original code looking alike. Suppose
checkout calculates tax once on the order subtotal, while invoices must calculate and round tax for each line item to
meet an accounting requirement:

```python
def checkout_total(subtotal, tax_rate):
    tax = round(subtotal * tax_rate, 2)
    return subtotal + tax


def invoice_total(line_items, tax_rate):
    subtotal = sum(item.amount for item in line_items)
    tax = sum(round(item.amount * tax_rate, 2) for item in line_items)
    return subtotal + tax
```

The two calculations can now produce different totals because rounding each line is not always equivalent to rounding
the combined subtotal. If those differences express intentional policies, forcing both workflows through
`calculate_tax(subtotal, tax_rate)` would be the wrong abstraction. Keeping separate functions lets each policy grow
without adding modes or exceptions to a supposedly shared rule.

By contrast, identical code that implements separate policies is only coincidentally duplicated. Removing the text
does not remove duplicated knowledge; it declares that the knowledge is shared.

## How the wrong abstraction grows

A premature abstraction often begins cleanly. Two operations happen to send similar notifications, so they share a
helper:

```python
def send_notification(user, message):
    email_client.send(user.email, message)
```

Then their requirements separate. A security alert must always use email, record an audit event, and avoid including
sensitive details. A marketing update respects channel preferences and can be skipped when a user opts out. The helper
expands to accommodate both:

```python
def send_notification(
    user,
    message,
    *,
    security_alert=False,
    respect_preferences=True,
    audit=False,
):
    if respect_preferences and user.marketing_opt_out:
        return

    email_client.send(user.email, message)

    if security_alert and audit:
        audit_log.record(user.id, "security notification sent")
```

The flags are not merely an untidy interface. They reveal that one function contains multiple policies. Callers must
know which combination is valid, and changes to either workflow pass through a shared piece of code.

Separating the operations may repeat the final call to the email client, but it restores meaningful boundaries:

```python
def send_security_alert(user, safe_message):
    email_client.send(user.email, safe_message)
    audit_log.record(user.id, "security notification sent")


def send_marketing_update(user, message):
    if user.marketing_opt_out:
        return

    email_client.send(user.email, message)
```

The repeated line is cheaper than coupling security policy to marketing preferences. If a stable lower-level concept
emerges—such as reliable email delivery—it can still be extracted without combining the two workflows.

## An abstraction is a coupling decision

The same issue appears in data models. Consider two types with matching fields:

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

Replacing both with `Address` looks like an easy cleanup, but it also says the concepts have one definition. Shipping
may later need delivery instructions, while billing may need tax jurisdiction or verification status. Keeping both
types costs a few repeated lines and preserves their ability to change separately.

Every abstraction creates a contract. Before introducing one, ask:

- Do these callers share a business rule, or only an implementation shape?
- If one caller changes, should the others change too?
- Can the abstraction be named after a stable concept rather than a vague mechanism?
- Are the differences exceptional, or are they evidence of separate responsibilities?

If the answers are unclear, duplication can postpone a hard-to-reverse design decision until the system provides more
evidence.

## Warning signs that DRY has gone too far

An abstraction deserves another look when:

- Boolean flags select unrelated modes of operation.
- Most parameters are optional because different callers need different subsets.
- A change for one caller repeatedly causes regressions in another.
- The abstraction has a vague name such as `common`, `base`, `shared`, `manager`, or `processor`.
- Callers must transform natural domain data into a generic shape and then transform the result back.
- Comments explain which combinations of options are valid.
- Tests mostly cover permutations of configuration rather than a coherent behavior.
- Developers copy code out of the abstraction because extending it is harder than working around it.

None of these signs proves that an abstraction is wrong. They are prompts to check whether the code still represents
one concept.

## When duplication is the problem

Duplicated code is not automatically harmless. It becomes expensive when copies are expected to remain consistent but
drift apart.

Look for evidence such as:

- The same defect must be fixed in several locations.
- A policy change requires a repository-wide search to find every copy.
- Tests repeat the same business examples for several implementations.
- Developers describe one copy as the canonical version.
- Differences between copies are accidental rather than intentional.

At that point, the system is showing that the code changes together. The abstraction is no longer based only on visual
similarity; it is supported by change history and domain knowledge.

## A practical approach to refactoring

When repetition appears, first name the concept each copy represents. Avoid starting with the mechanics of the code.
“Both functions loop over records” is weaker evidence than “both functions enforce the account eligibility policy.”

Next, imagine a likely change. Would the same requirement apply to every copy? If one copy could reasonably change
without the others, preserve that boundary. If all copies must change for the same reason, sharing the rule may reduce
risk.

If the evidence is still incomplete, wait for another example. A third use case often reveals which parts are stable
and which were accidental similarities between the first two. Waiting is not a refusal to design; it is using observed
requirements instead of guessing at a general solution.

When a wrong abstraction already exists, do not keep adding options to protect the appearance of reuse. A safer
sequence is:

1. Copy the behavior back into the callers.
2. Simplify each copy around its own responsibility.
3. Compare the resulting implementations.
4. Extract only the concepts that now have the same name, meaning, and reason to change.

This process may temporarily increase duplication. That is acceptable: the duplication makes the real boundaries
visible, while the old abstraction hid them.

## Optimize for change, not line count

DRY is valuable because a system should have one authoritative expression of each rule. It becomes harmful when
similar syntax is mistaken for shared knowledge.

The right question is not “Can these lines be combined?” It is “Should these concepts change together?” A good
abstraction makes the answer explicit and gives a stable idea a clear name. A wrong abstraction forces independent
ideas through the same interface.

A few duplicated lines are easy to see, compare, and remove later. Coupling built on a false assumption spreads into
callers, tests, data models, and team habits. Until the relationship is understood, preserving independence is often
the cheaper choice.
