---
title: "Algorithm Detection in Assembly"
categories:
  - Projects
tags:
  - projects
  - assembly
  - algorithm
  - nsa
---

During my senior year at [Purdue University](http://www.purdue.edu/) I had the opportunity to work on a research project in which we as a team had to detect algorithms in assembly using IDA Pro as a tool. We decided to work in a set of plugins that would help a user in identifying known algorithms within a binary. As we looked at this project we decided to come up with three different plugins. One plugin would be a proof of concept to detect Bubble Sort in a binary, the other two would be a generic approach.

The first one was a signature approach in which each algorithm would be represented by a vector that would be unique to that algorithm, based of the assembly instructions, the count of back edges, and the amount of branches in a function. These would hopefully prove to be a unique identifier to an algorithm. There were some issues with false positives with this approach but with some more fine tuning this can prove to be quite accurate.

The second generic approach, which I was in charge of developing, was based on work by [Thomas Dullien](http://static.googleusercontent.com/external_content/untrusted_dlcp/www.zynamics.com/en/us/downloads/bindiffsstic05-1.pdf) and is called Small Primes Product. The basic idea is for each operation to have a unique small prime associated with it starting at 3. For each function you take the product of all the operations. This would give a unique values to each function and the prime factorization for that function will also be unique.

The two generic approaches require that the user “learn” some functions before it can detect them. We implemented all of these techniques to aid a user in quickly identifying what a binary is trying to do. [Here](https://github.com/rahul0705/assemblyAlgorithmDetection/raw/master/TheGrandFinale.pdf) is a PDF that talks about each of the techniques with more depth. The source code and sample binaries used for testing can be found on the github [here](https://github.com/rahul0705/assemblyAlgorithmDetection).

This project had guidance from the National Security Agency and Professor Spafford from Purdue University.
