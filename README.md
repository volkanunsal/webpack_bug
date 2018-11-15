= Webpack bug replication

```
yarn && yarn start
```

== How to replicate

=== Buggy condition

- start the app using `yarn run buggy`
- focus in the input field
- enter any key repetitively
- observe: focus is lost

=== Without bug

- start the app using `yarn run normal`
- focus in the input field
- enter any key repetitively
- observe: focus is NOT lost

== Conditions that produce bug

- `mode` must be set to production
- `moduleConcatenation` plugin must be enabled
- `devtool` must be a non-eval source-map option.

