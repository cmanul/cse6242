import csv
import json
import time
import tweepy
import logging

# You must use Python 3.0 or above
# For those who have been using python 2.7.x before, here is an article explaining key differences between python 2.7x & 3.x
# http://sebastianraschka.com/Articles/2014_python_2_3_key_diff.html

# Rate limit chart for Twitter REST API - https://dev.twitter.com/rest/public/rate-limits

def loadKeys(key_file):
    # TODO: put in your keys and tokens in the keys.json file,
    #       then implement this method for loading access keys and token from keys.json
    # rtype: str <api_key>, str <api_secret>, str <token>, str <token_secret>
    with open('keys.json', 'r') as f:
        content = json.load(f)
    return content['api_key'], content['api_secret'], content['token'], content['token_secret']

# Q1.b - 5 Marks
def getFollowers(api, root_user, no_of_followers):
    followers = []
    for i in range(5):
        try:
            followers = api.followers(screen_name=root_user)
            break
        except tweepy.RateLimitError:
            logging.warn("Rate limite: getting followers for %s, tried %d time(s)", root_user, i + 1)
            time.sleep(15*60)
    return [(follower.screen_name, root_user) for follower in followers[:no_of_followers]]
    # TODO: implement the method for fetching 'no_of_followers' followers of 'root_user'
    # rtype: list containing entries in the form of a tuple (follower, root_user)

# Q1.b - 7 Marks
def getSecondaryFollowers(api, followers_list, no_of_followers):
    # TODO: implement the method for fetching 'no_of_followers' followers for each entry in followers_list
    # rtype: list containing entries in the form of a tuple (follower, followers_list[i])
    return [(f_follower, follower) for (follower, _) in followers_list
        for (f_follower, _) in getFollowers(api, follower, no_of_followers)]

# Q1.c - 5 Marks
def getFriends(api, root_user, no_of_friends):
    friends = []
    for i in range(5):
        try:
            friends = api.friends(screen_name=root_user)
            break
        except tweepy.RateLimitError:
            logging.warn("Rate limite: getting friends for %s, tried %d time(s)", root_user, i + 1)
            time.sleep(15*60)
    return [(root_user, friend.screen_name) for friend in friends[:no_of_friends]]
    # TODO: implement the method for fetching 'no_of_friends' friends of 'root_user'
    # rtype: list containing entries in the form of a tuple (root_user, friend)

# Q1.c - 7 Marks
def getSecondaryFriends(api, friends_list, no_of_friends):
    # TODO: implement the method for fetching 'no_of_friends' friends for each entry in friends_list
    # rtype: list containing entries in the form of a tuple (friends_list[i], friend)
    return [(friend, friend_friend) for (_, friend) in friends_list for (_, friend_friend) in getFriends(api, friend, no_of_friends)]

# Q1.b, Q1.c - 6 Marks
def writeToFile(data, output_file):
    # write data to output file
    # rtype: None
    with open(output_file, 'w', newline='') as csvfile:
        data_writer = csv.writer(csvfile)
        for datum in data:
            data_writer.writerow(datum)

"""
NOTE ON GRADING:

We will import the above functions
and use testSubmission() as below
to automatically grade your code.

You may modify testSubmission()
for your testing purposes
but it will not be graded.

It is highly recommended that
you DO NOT put any code outside testSubmission()
as it will break the auto-grader.

Note that your code should work as expected
for any value of ROOT_USER.
"""

def testSubmission():
    KEY_FILE = 'keys.json'
    OUTPUT_FILE_FOLLOWERS = 'followers.csv'
    OUTPUT_FILE_FRIENDS = 'friends.csv'

    ROOT_USER = 'PoloChau'
    NO_OF_FOLLOWERS = 10
    NO_OF_FRIENDS = 10


    api_key, api_secret, token, token_secret = loadKeys(KEY_FILE)

    auth = tweepy.OAuthHandler(api_key, api_secret)
    auth.set_access_token(token, token_secret)
    api = tweepy.API(auth)

    primary_followers = getFollowers(api, ROOT_USER, NO_OF_FOLLOWERS)
    secondary_followers = getSecondaryFollowers(api, primary_followers, NO_OF_FOLLOWERS)
    followers = primary_followers + secondary_followers

    primary_friends = getFriends(api, ROOT_USER, NO_OF_FRIENDS)
    secondary_friends = getSecondaryFriends(api, primary_friends, NO_OF_FRIENDS)
    friends = primary_friends + secondary_friends

    writeToFile(followers, OUTPUT_FILE_FOLLOWERS)
    writeToFile(friends, OUTPUT_FILE_FRIENDS)


if __name__ == '__main__':
    testSubmission()

