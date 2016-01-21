#!/usr/bin/env bash

APP=demo
meteor create "$APP"
cd "$APP"
mkdir packages
cd packages
git clone https://github.com/FGM/accounts-fake.git
cd ..
cp packages/accounts-fake/example.settings.json settings.json
meteor add accounts-fake
meteor --settings settings.json > /dev/null &
cd "$APP"

reset
clear
echo
echo "Now go to http://localhost:3000/ and open your JavaScript console, then type:"
echo
echo '    Meteor.loginWithFake({ user: "Kilroy", action: true}, function () { console.log("CB args", arguments); });'
echo
echo "You should see 'CB args -> []' if all went well. Now type:"
echo
echo "    Meteor.user();"
echo
echo "You can see your user object, with its complete information: profile and complete services parts."
echo "You can also check the Meteor users collection:"
echo
echo "    Meteor.users.find().fetch();"
echo
echo "In addition to the profile, you will see something in services.fake.public"
echo
echo "When you're done inspecting the results from the previous find(), logout like this:"
echo
echo "    Meteor.logout();"
echo
echo "Now check the Meteor users collection again and compare your user object:"
echo "    Meteor.users.find().fetch();"
echo
echo "Back to your shell console, type:"
echo "    meteor remove autopublish"
echo
echo "After Meteor has rebuilt the app, return to the JavaScript console in your browser, and login anew:"
echo
echo '    Meteor.loginWithFake({ user: "John Doe", action: true}, function () { console.log("CB args", arguments); });'
echo
echo "You should see 'CB args -> []' if all went well again. Now type:"
echo "    Meteor.user()"
echo
echo "You can see your user object, but only with its profile, not even public information."
echo
echo "Try to logout again and check the users collection this time."
echo "    Meteor.logout();"
echo "    Meteor.users.find().fetch()"
echo
echo "No user information will be available."
echo
echo "These use cases summarize the distinction between "
echo "- profile: public, always available if the user account is visible"
echo "- per-service public: public, but only available with autopublish"
echo "- per-service non-public: private to the current user, but still only available with autopublish"
