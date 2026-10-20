---
title: 'Algorithm Detection in Assembly'
draft: false
description: Using IDA Pro plugins, instruction signatures, and small-prime products to recognize known algorithms in binaries.
coverImage: ../../assets/covers/code.jpg
coverImageAlt: Laptop displaying source code on a white desk beside a monitor
section: Projects
tags:
  - assembly
  - algorithm
  - nsa

# cSpell:ignore Dullien Spafford
---

During my senior year at [Purdue University](http://www.purdue.edu/), I worked with a team on recognizing known
algorithms in assembly using IDA Pro. Looking beneath an abstraction to figure out what a program was actually doing
was very much my kind of problem.

We built three plugins. One was a proof of concept for detecting Bubble Sort in a binary. The other two took more
generic approaches, with the idea that a user could teach them known functions and then look for similar ones.

The first generic approach represented each algorithm as a vector: assembly instructions, back-edge counts, and the
number of branches in a function all contributed to its signature. We wanted those signatures to distinguish algorithms
from one another. In practice, we still had false positives. A recognizable pattern isn't always the one you're
looking for.

I developed the second generic approach, based on work by
[Thomas Dullien](http://static.googleusercontent.com/external_content/untrusted_dlcp/www.zynamics.com/en/us/downloads/bindiffsstic05-1.pdf).
It's called Small Primes Product. Each operation gets a small prime, starting at 3, and a function is represented by the
product of the primes associated with its operations. That product gives us a fingerprint to compare against functions
the plugin has already learned.

Both generic approaches required that learning step before they could detect anything. The goal was to give someone
examining a binary a useful starting point for understanding it, rather than making them work everything out from
scratch.

The [algorithm detection project report](https://github.com/rahul0705/assemblyAlgorithmDetection/raw/master/TheGrandFinale.pdf)
goes into each technique in more detail. The
[source code and sample binaries](https://github.com/rahul0705/assemblyAlgorithmDetection) are available on GitHub.

We had guidance from the National Security Agency and Professor Spafford at Purdue. It was a chance to take an interest
in reverse engineering and do something concrete with it.
