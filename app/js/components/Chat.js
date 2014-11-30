/**
 * @jsx React.DOM
 */
'use strict';

var React                    = require('react/addons');
var Reflux                   = require('reflux');
var _                        = require('underscore');
var io                       = require('socket.io-client');

var CourseRecipientsStore    = require('../stores/CourseRecipientsStore');
var CurrentConversationStore = require('../stores/CurrentConversationStore');
var CourseActions            = require('../actions/CourseActions');
var ChatActions              = require('../actions/ChatActions');
var RecipientList            = require('./RecipientList');
var Conversation             = require('./Conversation');

var Chat = React.createClass({

  mixins: [Reflux.ListenerMixin],

  propTypes: {
    currentUser: React.PropTypes.object.isRequired,
    course: React.PropTypes.object.isRequired
  },

  getDefaultProps: function() {
    return {
      currentUser: {},
      course: {}
    };
  },

  getInitialState: function() {
    return {
      error: null,
      recipients: [],
      conversation: {}
    };
  },

  _onRecipientsChange: function(err, recipients) {
    if ( err ) {
      this.setState({ error: err });
    } else {
      this.setState({
        error: null,
        recipients: recipients
      });
    }
  },

  _onConversationChange: function(err, conversation) {
    if ( err ) {
      this.setState({ error: err });
    } else {
      console.log('new conversation:', conversation);
      this.setState({
        error: null,
        conversation: conversation
      });
    }
  },

  componentWillMount: function() {
    this.listenTo(CourseRecipientsStore, this._onRecipientsChange);
    //this.listenTo(CurrentConversationStore, this._onConversationChange);

    if ( !_.isEmpty(this.props.course) && !_.isEmpty(this.props.currentUser) ) {
      CourseActions.openChat(this.props.course.id, this._onRecipientsChange);
    }
  },

  componentWillReceiveProps: function(prevProps) {
    if( !_.isEqual(this.props.course, prevProps.course) || !_.isEqual(this.props.currentUser, prevProps.currentUser) ) {
      CourseActions.openChat(this.props.course.id, this._onRecipientsChange);
    }
  },

  componentDidMount: function() {
    this.socket = io('http://localhost:3000');
  },

  openConversation: function(recipientId) {
    if ( _.isEmpty(this.state.conversation.recipient) || recipientId !== this.state.conversation.recipient.id ) {
      ChatActions.openConversation(this.props.course.id, recipientId, this._onConversationChange);
    }
  },

  render: function() {
    return (
      <section className="chat">

        <RecipientList currentUser={this.props.currentUser}
                       course={this.props.course}
                       recipients={this.state.recipients}
                       conversation={this.state.conversation}
                       openConversation={this.openConversation} />

        <Conversation currentUser={this.props.currentUser}
                      course={this.props.course}
                      conversation={this.state.conversation} />

      </section>
    );
  }

});

module.exports = React.createFactory(Chat);