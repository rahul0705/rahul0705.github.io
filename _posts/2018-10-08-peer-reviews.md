---
title: Code Reviews
categories:
  - Process
tags:
  - software
  - development
  - code
  - review
---

A basic guide for reviewing code and having your code reviewed. This is a living document, expect it to change and evolve overtime, check back for updates.

# What to look for in a review

## Style

### Does the code follow the D.R.Y. (Don't Repeat Yourself) principle?

Is there repeated code that can be factored out to a helper function? As you develop it's worth seeing if **relevant** code can be extracted to eliminate redundant code. This should simplify where our logic exists. This should reduce the amount of places that bugs can creep into and simplifies the amount of locations a patch would need to be applied to.

It's worth mentioning that factoring code into a common location may not be as straightforward as presented below. Limitations in the technologies chosen determine our level of 'D.R.Y.ness'. What is important to keep in mind is that we are attempting to minimize redundant logic as best we can.

```python
def thing1(arg1):
  if arg1 == 'a':
    work_on = 'correct'
  else
    work_on = 'incorrect'
  # do things with work_on

def thing2(arg2):
  if arg2 == 'a':
    work_on = 'correct'
  else
    work_on = 'incorrect'
  # do things with work_on

def thing3(arg3):
  if arg3 == 'a':
    work_on = 'correct'
  else
    work_on = 'incorrect'
  # do things with work_on
```

vs

```python
def check_arg(arg):
  if arg == 'a':
    return 'correct'
  else
    return 'incorrect'

def thing1(arg1):
  work_on = check_arg(arg1)

def thing2(arg2):
  work_on = check_arg(arg2)

def thing3(arg3):
  work_on = check_arg(arg3)
```

### Does the code exit early?

Are there loops or functions that can exit early? It's generally better to exit loops or functions earlier rather than later. This can sometime be a performance gain, but more than anything it greatly improves readability.

```python
def func(items):
  if items:
    for item in items:
      print item
```

vs

```python
def func(items):
  if not items:
    return
  for item in items:
    print item
```

### Are the returns simple?

Check if return statements can be simplified. Sometime it's best to let the language do the work for you. Instead of checking for a `boolean` and then explicitly returning `True` or `False` it's much more reliable and readable to just return the conditional check.

```python
def item_exists(x, items):
  if x in items:
    return True
  else:
    return False
```

vs

```python
def item_exists(x, items):
  return x in items
```

### Is there unused code?

The best code is no code. Removing code should be one of your activities as a developer. Keep an eye out for:

- commented out code
- empty methods
- unused variables
- outdated comments
- leftover imports

Code linters can help greatly with this.

It's important to distinguish 'empty methods' and 'stub methods'. Stub functions are great early on in the project, they allow the developer to lay the foundation for future tasks, just make sure these 'stud methods' serve a real purpose.

### Is the code shy?

Shy code is code that does not interact with too many things. Everything should have the smallest scope possible and only increase the scope if really need to.

### Are there hard-coded values?

Whenever you see Hard-coded values, first ask yourself if there is another way you could remove this static value and make it configurable?

### Does it follow the style guide and coding conventions?

Almost every company or team should have a style and coding guide. Make sure all code meets these standards. If your team doesn't have one there are plenty to be found [online](https://github.com/google/styleguide)

## Tests

### Does the code have unit tests?

If there is new code, are they accompanied by unit tests? If modifying existing code, have the unit tests been updated?

### Does the code have integration tests?

Testing code in isolation will not check how the entire baseline functions. Do the integration tests need to be updated?
