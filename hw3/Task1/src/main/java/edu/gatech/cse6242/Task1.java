package edu.gatech.cse6242;

import java.io.IOException;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class Task1 {
public static class SimpleMapper
       extends Mapper<Object, Text, IntWritable, IntWritable>{

    private IntWritable tgt = new IntWritable();
    private IntWritable weight = new IntWritable();

    public void map(Object key, Text value, Context context
                    ) throws IOException, InterruptedException {
      String[] splits = value.toString().split("\t");
      tgt.set(Integer.valueOf(splits[1]));
      weight.set(Integer.valueOf(splits[2]));
      context.write(tgt, weight);
    }
  }

  public static class IntMaxReducer
       extends Reducer<IntWritable,IntWritable,IntWritable,IntWritable> {
    private IntWritable result = new IntWritable();

    public void reduce(IntWritable key, Iterable<IntWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      int max = values.iterator().next().get();
      for (IntWritable val : values) {
        if(val.get() > max) {
            max = val.get();
        }
      }
      result.set(max);
      context.write(key, result);
    }
  }

  public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Task1");

    /* TODO: Needs to be implemented */
    job.setJarByClass(Task1.class);
    job.setMapperClass(SimpleMapper.class);
    job.setCombinerClass(IntMaxReducer.class);
    job.setReducerClass(IntMaxReducer.class);
    job.setOutputKeyClass(IntWritable.class);
    job.setOutputValueClass(IntWritable.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
