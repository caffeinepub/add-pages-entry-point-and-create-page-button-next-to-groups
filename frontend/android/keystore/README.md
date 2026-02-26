# Android Keystore Management

This directory is for documentation only. **DO NOT** store actual keystore files here or commit them to version control.

## What is a Keystore?

A keystore is a binary file that contains your app's signing key. Android requires all apps to be digitally signed before installation. The keystore proves you are the legitimate developer of the app.

## Creating a Keystore

Use Java's `keytool` to generate a keystore:

