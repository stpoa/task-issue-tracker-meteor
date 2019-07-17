/* eslint-env mocha */

import { Meteor } from 'meteor/meteor'
import { assert } from 'chai'

import { Issues } from './issues.js'

if (Meteor.isServer) {
  describe('Issues', () => {
    describe('methods', () => {
      let issueId
      let userId

      beforeEach(() => {
        Meteor.users.remove({})
        userId = Accounts.createUser({
          username: 'username123',
          email: 'email123',
          password: 'password123',
          profile: {},
        })

        Issues.remove({})
        issueId = Issues.insert({
          title: 'test issue title',
          description: 'test issue description',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        })
      })

      it('can delete owned issue', () => {
        // Find the internal implementation of the issue method so we can
        // test it in isolation
        const deleteIssue = Meteor.server.method_handlers['issues.remove']

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId }

        // Run the method with `this` set to the fake invocation
        deleteIssue.apply(invocation, [issueId])

        // Verify that the method does what we expected
        assert.equal(Issues.find().count(), 0)
      })

      it('can insert new issue', () => {
        const insertIssue = Meteor.server.method_handlers['issues.insert']
        const invocation = { userId }
        const title = 'new title'
        const description = 'new description'

        insertIssue.apply(invocation, [title, description])

        assert.equal(Issues.find().count(), 2)
        assert.equal(Issues.find({ title }).count(), 1)
      })
    })
  })
}
