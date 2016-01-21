# Accounts-fake

This is a fake accounts package for Meteor 1.2.

It implements the APIs needed to build a real accounts package, but uses a basic `user`/`action` pair, with this truth table, trying to log in as user `"foo"`.

| "foo" exists ? | action    | result                                     |
|:--------------:|:---------:|--------------------------------------------|
| true           | true      | logged-in as "foo"                         |
| true           | false     | login failure                              |
| false          | true      | user "foo" created, and logged-in as "foo" |
| false          | false     | login failure                              |

# Running a demo

Download the demo runner from [https://github.com/FGM/accounts-fake/blob/master/demo-fake.bash]([https://github.com/FGM/accounts-fake/blob/master/demo-fake.bash)

Run it and follow its instructions to walk through a demo of the package.


# Logging in and out

This is performed client-side: invoke the Meteor standard login process using the `fake` login service:

    // To successfully log in, possibly creating the "foo" account.
    Meteor.loginWithFake("foo", true, callback);

    // To fail at logging in.
    Meteor.loginWithFake("foo", false, callback);

    // To logout.
    Meteor.logout();


# Configuring the package

This package currently uses a simple configuration to demonstrate use of the accounts service configuration mechanism. It is made of two keys: `public` and `secret`. The truth table for the package is the following:

| "public"         | "secret"             | package status                        |
|:----------------:|:--------------------:|:--------------------------------------|
| undefined        | undefined            | unconfigured                          |
| anything defined | not same as "public" | configuration error: invalid "secret" |
| anything defined | same as "public"     | package configured                    |

The package takes its configuration from `Meteor.settings`, exposing its `public` value and hiding its `secret` on the client side.

This means your `settings.json` file must look somehow like this:

    {
      "fake": {
        "secret": "the secret, share you will"
      },
      "public": {
        "fake": {
          "public": "the secret, share you will"
        },
      },
    }

And your application using the package must be called like this to use settings:

    meteor --settings settings.json
