#!/usr/bin/env python3
#
#
# Program to connect to our node.js word store through the provided REST API and
# both test and verify proper function
#
#

import requests; # http://requests.readthedocs.org/en/latest/user/install/ or apt/yum

# conn = {'host': '127.0.0.1',  # {} equivalent to new dict();
#        'port': 8000};

connstr = "http://127.0.0.1:8000/";

test_terms = { 'one': 1,
               'two': 2,
               'three': 3,
               # 'fifty': 50,
               # 'onehundred': 100,
               # 'tenthousand': 10000,
           }; # remember that dicts are not stored in order

test_nonterms = ["python", "ruby", "perl", "common lisp"]; #last is invalid


# connection pooling is automatic with requests! Hooray!

# Available verbs are:
# PUT /word/WORDNAME -- accept one word in form { "word": "ONE_WORD" } and count++
# GET /words/WORDNAME -- return { "wordname": integer_count }
# GET /words -- return JSON hash of all words and counts {"W": 1, "W2": 3, "W3": 5, "W4": 11}

# check original state

# r = requests.get('http://' + conn['host'] + ":" + str(conn['port']) + '/words');
r = requests.get(connstr + 'words');

print("Checking empty wordstore. Status: " + str(r.status_code));
print(r.text); #parse JSON later

# test one put

r = requests.put(connstr + 'word/' + "ABC", data = "{ \"word\": \"ABC\" }" );

print("PUT for ABC");
print(r.text);


r = requests.get(connstr + 'words/ABC');

print("GET for ABC");
print(r.text);


# insert all our terms

for t in test_terms.keys():
    for _ in range(test_terms[t]): # no better way to repeat x times? Maybe a block repeat?
        r = requests.put(connstr + 'word/' + t, data = "{ \"word\": \"" + t + "\" }" );

# query individually

for t in test_terms.keys():
    r = requests.get(connstr + 'word/' + t);
    print(r.text);

# test for terms not included in previous PUTs
for t in test_nonterms: #array not dictionary
    r = requests.get(connstr + 'words/' + t);
    print(r.text);

# return all terms and print
r = requests.get(connstr + 'words');

print("GET all words and counts");
print(r.text);


