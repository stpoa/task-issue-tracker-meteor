import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'

import { Issues, issueStatuses } from '../api/issues'

import Issue from './Issue'
import AccountsUIWrapper from './AccountsUIWrapper.js'

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hideCompleted: false,
    }
  }

  handleSubmit(event) {
    event.preventDefault()

    // Find the text field via the React ref
    const { titleTextInput, descriptionTextInput } = this.refs
    const title = ReactDOM.findDOMNode(titleTextInput).value.trim()
    const description = ReactDOM.findDOMNode(descriptionTextInput).value.trim()

    Meteor.call('issues.insert', title, description, (error, result) => {
      if (error) {
        alert(error.message)
      }
    })

    // Clear form
    ReactDOM.findDOMNode(descriptionTextInput).value = ''
    ReactDOM.findDOMNode(titleTextInput).value = ''
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    })
  }

  renderIssues() {
    let filteredIssues = this.props.issues
    if (this.state.hideCompleted) {
      filteredIssues = filteredIssues.filter(
        issue => issue.status !== issueStatuses.closed,
      )
    }
    return filteredIssues.map(issue => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id
      const showPrivateButton = issue.owner === currentUserId

      return (
        <Issue
          key={issue._id}
          issue={issue}
          showPrivateButton={showPrivateButton}
        />
      )
    })
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Issue List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted.bind(this)}
            />
            Hide Completed Issues
          </label>

          <AccountsUIWrapper />

          {this.props.currentUser ? (
            <form className="new-issue" onSubmit={this.handleSubmit.bind(this)}>
              <input
                name="title"
                type="text"
                ref="titleTextInput"
                placeholder="Type issue name"
              />
              <input
                name="description"
                type="text"
                ref="descriptionTextInput"
                placeholder="Type issue description"
              />
              <input type="submit" />
            </form>
          ) : (
            ''
          )}
        </header>

        <ul>{this.renderIssues()}</ul>
      </div>
    )
  }
}

export default withTracker(() => {
  Meteor.subscribe('issues')

  return {
    issues: Issues.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Issues.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  }
})(App)
