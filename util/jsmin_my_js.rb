#!/usr/bin/ruby

dir = ARGV[0] || File.dirname(__FILE__) + '/..'
js_files = Dir[dir + '/support/**/*.js']

js_files.each do |f|
  out = f.split('.')
  next if out.include?("min")
  out.insert(-2, 'min')
  out = out.join('.')
  `#{dir}/util/jsmin.rb < #{f} > #{out}`
end

