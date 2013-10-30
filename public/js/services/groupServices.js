'use strict';

/**
 * Services that persists and retrieves user from localStorage.
 */

angular.module('groupServices', ['ngResource']).
    factory('Groups', ['API_URL', '$resource', 'User', '$q', 'Members',
      function(API_URL, $resource, User, $q, Members) {
        var Group = $resource(API_URL + '/api/v1/groups/:gid',
          {gid:'@_id', messageId: '@_messageId'},
          {
            query: {method: "GET", isArray:false},
            postChat: {method: "POST", url: API_URL + '/api/v1/groups/:gid/chat'},
            deleteChatMessage: {method: "DELETE", url: API_URL + '/api/v1/groups/:gid/chat/:messageId'},
            join: {method: "POST", url: API_URL + '/api/v1/groups/:gid/join'},
            leave: {method: "POST", url: API_URL + '/api/v1/groups/:gid/leave'},
            invite: {method: "POST", url: API_URL + '/api/v1/groups/:gid/invite'},
            removeMember: {method: "POST", url: API_URL + '/api/v1/groups/:gid/removeMember'}
          });

        // The user may not visit the public guilds, personal guilds, and tavern pages. So
        // we defer loading them to the html until they've clicked the tabs
        var partyQ = $q.defer(),
          guildsQ = $q.defer(),
          publicQ = $q.defer(),
          tavernQ = $q.defer();

        var groups = {
          party: partyQ.promise,
          guilds: guildsQ.promise,
          public: publicQ.promise,
          tavern: tavernQ.promise
        };

        // But we don't defer triggering Party, since we always need it for the header if nothing else
        Group.get({gid:'party'}, function(party){
          partyQ.resolve(party);
        })

        return {
          // Note the _.once() to make sure it can never be called again
          fetchGuilds: _.once(function(){
            Group.query(function(_groups){
              guildsQ.resolve(_groups.guilds);
              Members.populate(_groups.guilds);
              publicQ.resolve(_groups['public']);
              Members.populate(_groups['public']);
            })
          }),

          fetchTavern: _.once(function(){
            Group.get({gid:'habitrpg'}, function(tavern){
              tavernQ.resolve(tavern);
            })
          }),

          Group: Group,

          groups: groups

        }
      }
]);