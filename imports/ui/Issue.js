import React from 'react'
import { Meteor } from 'meteor/meteor'
import classnames from 'classnames'
import { issueStatuses } from '../api/issues'

const Issue = ({ issue, showPrivateButton }) => {
  const setStatus = status => Meteor.call('issues.setStatus', issue._id, status)
  const deleteThisIssue = () => Meteor.call('issues.remove', issue._id)
  const togglePrivate = () =>
    Meteor.call('issues.setPrivate', issue._id, !issue.private)

  const issueClassName = classnames({
    checked: issue.status === issueStatuses.closed,
    private: issue.private,
  })

  const handleStatusChange = e => setStatus(e.target.value)

  return (
    <li className={issueClassName}>
      <button className="delete" onClick={deleteThisIssue.bind(this)}>
        &times;
      </button>

      <select
        disabled={issue.status === issueStatuses.closed}
        value={issue.status}
        onChange={handleStatusChange}
      >
        {Object.values(issueStatuses)
          .filter(status =>
            issue.status === issueStatuses.pending &&
            status === issueStatuses.open
              ? false
              : true,
          )
          .map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
      </select>

      {showPrivateButton ? (
        <button className="toggle-private" onClick={togglePrivate.bind(this)}>
          {issue.private ? 'Private' : 'Public'}
        </button>
      ) : (
        ''
      )}

      <span className="text">
        <strong>{issue.username}</strong>: <strong>{issue.title}</strong> |{' '}
        {issue.description}
      </span>
    </li>
  )
}

export default Issue
