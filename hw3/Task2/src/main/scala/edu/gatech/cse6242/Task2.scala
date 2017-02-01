package edu.gatech.cse6242

import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark.SparkConf

object Task2 {
  def main(args: Array[String]) {
    val sc = new SparkContext(new SparkConf().setAppName("Task2"))

    // read the file
    val file = sc.textFile("hdfs://localhost:8020" + args(0))
    // val file = sc.textFile(args(0))
    /* TODO: Needs to be implemented */
    file.cache()
    val out = file.map{case line =>
        val splits = line.split('\t')
        (splits(0).toInt, splits(2).toInt)
    }
    .filter(_._2 != 1)
    .reduceByKey(_ + _)

    val in = file.map{case line =>
        val splits = line.split('\t')
        (splits(1).toInt, splits(2).toInt)
    }
    .filter(_._2 != 1)
    .reduceByKey(_ + _)

    val res = in.fullOuterJoin(out)
        .mapValues {
            case (Some(v), Some(w)) => v - w
            case (None, Some(w)) => -w
            case (Some(v), None) => v
        }
        .map{case (k, v) => s"$k\t$v"}
    // println(s"hi: ${in.count}, ${out.count}, ${res.count}")
    // store output on given HDFS path.
    // YOU NEED TO CHANGE THIS
    res.saveAsTextFile("hdfs://localhost:8020" + args(1))
    // res.saveAsTextFile(args(1))
  }
}
