# /usr/local/spark/bin/spark-submit --class edu.gatech.cse6242.Task2 --master local \
#   target/task2-1.0.jar /nethome/hsu34/teaching/6242-hw3-skeleton/graph1.tsv /nethome/hsu34/teaching/6242-hw3-skeleton/Task2/task2output1

# cat task2output1/* > task2output1.tsv

spark-submit --class edu.gatech.cse6242.Task2 --master local \
  target/task2-1.0.jar /user/cse6242/graph1.tsv /user/cse6242/task2output1

hadoop fs -getmerge /user/cse6242/task2output1 task2output1.tsv
hadoop fs -rm -r /user/cse6242/task2output1
