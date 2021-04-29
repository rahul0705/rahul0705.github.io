---
title: How to use Git effectively
categories:
  - Software Development
tags:
  - software
  - development
  - git
---

This is a high level overview on the [branching model by Vincent Driessen which has been called GitFlow](https://nvie.com/posts/a-successful-git-branching-model/ 'A successful git branching model').

# Branches

## Master

The point of `master` is to be production ready. This is the branch new team member will build to get familiar with the baseline. Ideally this branch is **never** broken.

## Develop

The point of `develop` is to be the branch where all development will originate from. Feature and Release branches will be branching off `develop`. This is sometimes called the `integration` branch.

> This a good place to run your nightly build within your Continious Integration environment.

## Feature

The point of a `feature/<issue_number or description>` or `feature-<issue_number or description>` branch is isolate changes of a feature so a developer has a consistent baseline to work with. It is common practice to merge `develop` into your feature branch often to ensure your baseline will work with current changes. The `feature` branch will branch off `develop` and be merged back into `develop` when work is completed.

> This is a good place to run builds on a push bases within your Continious Integration environment.

## Release

The point of a `release/<version>` or `release-<version>` branch is to prepare for a release. This is the branch where do your version bumping and any other code changes related to the release. This is also where your test team should start doing preliminary testing so that issues can be caught **before** the release is official. The `release` branch will branch off `develop` and be merged into `master` and the `master` will be merged into `develop`.
