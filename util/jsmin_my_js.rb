#!/usr/bin/ruby

dir = File.dirname(__FILE__)
js_files = Dir[dir + '/../support/**/*.js']
puts js_files.inspect

js_files.each do |f|
  out = f.split('.')
  next if out.include?("min")
  out.insert(-2, 'min')
  out = out.join('.')
  puts out
  `#{dir}/jsmin.rb < #{f} > #{out}`
end