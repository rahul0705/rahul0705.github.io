---
title: How to use Git effectively
draft: false
description: A 2019 overview of how GitFlow uses master, develop, feature, and release branches to move changes toward production.
coverImage: ../../assets/covers/git.jpg
coverImageAlt: Close-up of syntax-highlighted Python code on a dark screen
section: Process
tags:
  - software
  - development
  - git

# cSpell:ignore Driessen
---

This is a high-level overview of
[Vincent Driessen's branching model, usually called GitFlow][gitflow-model]. Each branch has a job, which helps answer
the question "Where does this change belong?" before everyone develops their own answer.

[gitflow-model]: https://nvie.com/posts/a-successful-git-branching-model/ 'A successful git branching model'

## Branches

## Master

`master` is meant to be production ready. It's the branch a new team member can build to get familiar with the
baseline. Ideally, this branch is **never** broken. "Welcome aboard; the build is broken" is a rough introduction.

## Develop

`develop` is where development starts. Feature and release branches branch off it, which is why it's sometimes called
the `integration` branch.

> This is a good place to run your nightly build within your Continuous Integration environment.

## Feature

A `feature/<issue_number or description>` or `feature-<issue_number or description>` branch isolates a feature's
changes so a developer has a consistent baseline to work with. It's common practice to merge `develop` into your feature
branch often to check that your work still fits with the other changes. The feature branch starts from `develop` and
merges back into `develop` when the work is complete.

> This is a good place to run builds on each push within your Continuous Integration environment.

## Release

A `release/<version>` or `release-<version>` branch gives you a place to prepare a release: bump the version and make
other release-related code changes. This is also where the test team starts preliminary testing, so issues can be
caught **before** the release is official. The release branch starts from `develop` and merges into `master`. Then
`master` is merged back into `develop`.
