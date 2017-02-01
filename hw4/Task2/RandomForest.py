import csv
import numpy as np  # http://www.numpy.org
import ast
from random import randrange

"""
Here, X is assumed to be a matrix with n rows and d columns
where n is the number of total records
and d is the number of features of each record
Also, y is assumed to be a vector of d labels

XX is similar to X, except that XX also contains the data label for
each record.
"""

"""
This skeleton is provided to help you implement the assignment. It requires
implementing more that just the empty methods listed below.

So, feel free to add functionalities when needed, but you must keep
the skeleton as it is.
"""

class RandomForest(object):
    class __DecisionTree(object):
        def __init__(self): 
            # Initialize 
            self.tree = None
            self.leaf_size = 1
            self.max_try = 10

        def learn(self, X, y):
            self.tree = self._build_tree(X, y)

        def _build_tree(self, X, y):
            """
            recursively build tree in top down manner
            """
            n_sample = X.shape[0]
            n_feautre = X.shape[1]

            # no need to split any more
            if n_sample <= self.leaf_size:
                label = 1 if sum(y) > self.leaf_size / 2.0 else 0 # only work for binary
                return [[-1, label, -1]]
            if sum(y) == len(y):
                return [[-1, y[0], -1]]

            # random pick a feature and try split
            try_index = 0
            while try_index < self.max_try:
                i = randrange(0, n_feautre)
                first, second = randrange(0, n_sample), randrange(0, n_sample)
                while first == second:
                    first, second = randrange(0, n_sample), randrange(0, n_sample)
                median = (X[first, i] + X[second, i]) / 2.0
                mask = X[:, i] <= median
                mask_sum = mask.sum()
                if mask_sum != 0 and mask_sum != n_sample:
                    break
                try_index += 1

            # failed to find a split, use majority
            if try_index == self.max_try:
                label = 1 if sum(y) > self.leaf_size / 2.0 else 0 # only work for binary
                return [[-1, label, -1]]

            left = self._build_tree(X[mask], y[mask])
            mask = np.invert(mask)
            right = self._build_tree(X[mask], y[mask])
            root = [[i, median, len(left) + 1]]
            return root + left + right

        def classify(self, record):
            # return label by visting a leafnode
            index = 0
            node = self.tree[0]
            while node[0] != -1:
                if record[node[0]] <= node[1]:
                    index += 1
                else:
                    index += node[2]
                node = self.tree[index]
            # print node
            return node[1]


    def __init__(self, num_trees):
        # do initialization here.
        self.num_trees = num_trees
        self.decision_trees = [self.__DecisionTree() for i in range(num_trees)]
        self.bootstraps_datasets = [] # the bootstrapping dataset for trees
        self.bootstraps_labels = []
        self.masks = []

    def _bootstrapping(self, XX, n):
        indicies = np.random.choice(n, n, replace=True)
        mask = [False] * n
        for i in indicies:
            mask[i] = True
        mask = np.array(mask)
        X = XX[indicies, :-1]
        y = XX[indicies, -1]
        return mask, X, y.astype(np.int32)

    def bootstrapping(self, XX):
        XX = np.array(XX)
        for i in range(self.num_trees):
            mask, data_sample, data_label = self._bootstrapping(XX, len(XX))
            self.bootstraps_datasets.append(data_sample)
            self.bootstraps_labels.append(data_label)
            self.masks.append(mask)
        # use mask to avoid redundant check
        self.masks = np.array(self.masks).transpose()

    def fitting(self):
        for X, y, tree in zip(self.bootstraps_datasets, self.bootstraps_labels, self.decision_trees):
            print "fitting tree.."
            tree.learn(X, y)

    def voting(self, X):
        y = []
        for row, mask in zip(X, self.masks):
            vote = [0 , 0]
            for tree, included in zip(self.decision_trees, mask):
                if not included:
                    vote[tree.classify(row)] += 1
            # if tie or no vote return 0
            y.append(0 if vote[0] >= vote[1] else 1)
        return np.array(y, dtype=int)

def main():
    X = list()
    y = list()
    XX = list() # Contains data features and data labels

    # Note: you must NOT change the general steps taken in this main() function.

    # Load data set
    with open("hw4-data.csv") as f:
        next(f, None)

        for line in csv.reader(f, delimiter = ","):
            X.append(line[:-1])
            y.append(line[-1])
            xline = [ast.literal_eval(i) for i in line]
            XX.append(xline[:])

    # Initialize according to your implementation
    forest_size = 100

    # Initialize a random forest
    randomForest = RandomForest(forest_size)

    # Create the bootstrapping datasets
    randomForest.bootstrapping(XX)

    # Build trees in the forest
    randomForest.fitting()

    # Provide an unbiased error estimation of the random forest
    # based on out-of-bag (OOB) error estimate.
    # Note that you may need to handle the special case in
    #       which every single record in X has used for training by some
    #       of the trees in the forest.
    y_truth = np.array(y, dtype = int)
    X = np.array(X, dtype = float)
    y_predicted = randomForest.voting(X)

    #results = [prediction == truth for prediction, truth in zip(y_predicted, y_test)]
    results = [prediction == truth for prediction, truth in zip(y_predicted, y_truth)]

    # Accuracy
    accuracy = float(results.count(True)) / float(len(results))
    print "accuracy: %.4f" % accuracy

main()
