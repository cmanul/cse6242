package edu.gatech.cse6242;

import org.apache.hadoop.fs.*;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import java.io.IOException;

public class Task4 {
    public static class SimpleMapper
       extends Mapper<Object, Text, IntWritable, IntWritable>{

    private IntWritable node = new IntWritable();
    private final static IntWritable one = new IntWritable(1);

    public void map(Object key, Text value, Context context
                    ) throws IOException, InterruptedException {
      String[] splits = value.toString().split("\t");
      if (splits.length > 1) {
          node.set(Integer.valueOf(splits[0]));
          context.write(node, one);

          node.set(Integer.valueOf(splits[1]));
          context.write(node, one);
      }
    }
  }

  public static class IntSumReducer
       extends Reducer<IntWritable,IntWritable,IntWritable,IntWritable> {
    private IntWritable result = new IntWritable();
    private final static IntWritable one = new IntWritable(1);

    public void reduce(IntWritable key, Iterable<IntWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      int sum = 0;
      for (IntWritable val : values) {
        sum += val.get();
      }
      result.set(sum);
      context.write(key, result);
    }
  }

  public static class SwitchKVMapper
       extends Mapper<Object, Text, IntWritable, IntWritable>{
    // private IntWritable first = new IntWritable();
    private IntWritable second = new IntWritable();
    private final static IntWritable one = new IntWritable(1);

    public void map(Object key, Text value, Context context
                    ) throws IOException, InterruptedException {
      String[] splits = value.toString().split("\t");
      if (splits.length > 1) {
        // first.set(Integer.valueOf(splits[0]));
        second.set(Integer.valueOf(splits[1]));
        context.write(second, one);
      }
    }
  }

  public static class IntSumReducer2
       extends Reducer<IntWritable,IntWritable,IntWritable,IntWritable> {
    private IntWritable result = new IntWritable();

    public void reduce(IntWritable key, Iterable<IntWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      int sum = 0;
      for (IntWritable val : values) {
        sum += val.get();
      }
      result.set(sum);
      context.write(key, result);
    }
  }


  public static void main(String[] args) throws Exception {
    String tmpPath = args[1] + "-tmp";
    Job job1 = Job.getInstance(new Configuration(), "Task4-Step1");

    job1.setJarByClass(Task4.class);
    job1.setMapperClass(SimpleMapper.class);
    job1.setCombinerClass(IntSumReducer.class);
    job1.setReducerClass(IntSumReducer.class);
    job1.setOutputKeyClass(IntWritable.class);
    job1.setOutputValueClass(IntWritable.class);

    FileInputFormat.addInputPath(job1, new Path(args[0]));
    FileOutputFormat.setOutputPath(job1, new Path(tmpPath));
    // job1.waitForCompletion(true);

    Job job2 = Job.getInstance(new Configuration(), "Task4-Step2");

    job2.setJarByClass(Task4.class);
    job2.setMapperClass(SwitchKVMapper.class);
    job2.setCombinerClass(IntSumReducer2.class);
    job2.setReducerClass(IntSumReducer2.class);
    job2.setOutputKeyClass(IntWritable.class);
    job2.setOutputValueClass(IntWritable.class);

    FileInputFormat.addInputPath(job2, new Path(tmpPath));
    FileOutputFormat.setOutputPath(job2, new Path(args[1]));
    if (job1.waitForCompletion(true)) {
        if (job2.waitForCompletion(true)) {
            //TODO clean up
            FileSystem.get(new Configuration()).delete(new Path(tmpPath), true);
            System.exit(0);
        } else {
            System.exit(1);
        }
    } else {
        System.exit(1);
    }
  }
}
