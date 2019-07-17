import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'

export const Issues = new Mongo.Collection('issues')

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish issues that are public or belong to the current user
  Meteor.publish('issues', function issuesPublication() {
    return Issues.find({
      $or: [{ private: { $ne: true } }, { owner: this.userId }],
    })
  })
}

export const issueStatuses = {
  open: 'open',
  pending: 'pending',
  closed: 'closed',
}

const checkMinLength = min => str => {
  if (str.length < min)
    throw new Meteor.Error(
      'validation-min-length',
      'Input length should be at least ' + min + ' characters',
    )
}

Meteor.methods({
  'issues.insert'(title, description) {
    checkLength = checkMinLength(2)
    check(title, String)
    check(description, String)
    checkLength(title)
    checkLength(description)

    // Make sure the user is logged in before inserting a issue
    if (!this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    const userId = this.userId
    const { username } = Meteor.users.findOne(userId)

    Issues.insert({
      title,
      description,
      status: issueStatuses.open,
      createdAt: new Date(),
      owner: userId,
      username,
    })
  },
  'issues.remove'(issueId) {
    check(issueId, String)

    const issue = Issues.findOne(issueId)
    if (issue.private && issue.owner !== this.userId) {
      // If the issue is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized')
    }

    Issues.remove(issueId)
  },
  'issues.setStatus'(issueId, status) {
    check(issueId, String)
    check(status, String)
    if (!issueStatuses[status]) throw new Meteor.Error('validation')

    const issue = Issues.findOne(issueId)
    if (issue.private && issue.owner !== this.userId) {
      // If the issue is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized')
    }

    Issues.update(issueId, { $set: { status: status } })
  },
  'issues.setPrivate'(issueId, setToPrivate) {
    check(issueId, String)
    check(setToPrivate, Boolean)

    const issue = Issues.findOne(issueId)

    // Make sure only the issue owner can make a issue private
    if (issue.owner !== this.userId) {
      throw new Meteor.Error('not-authorized')
    }

    Issues.update(issueId, { $set: { private: setToPrivate } })
  },
})
