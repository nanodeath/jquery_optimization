#!/usr/bin/ruby

js_files = Dir['../support/**/*.js']
puts js_files.inspect

js_files.each do |f|
  out = f.split('.')
  out.insert(-2, 'min')
  out = out.join('.')
  puts out
  `./jsmin.rb < #{f} > #{out}`
end