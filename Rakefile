task :jsmin do
  `util/jsmin_my_js.rb`
end

task :commit => [:jsmin] do
  exec 'git commit -a'
end

task :pull do
  `git pull`
  `util/jsmin_my_js.rb`
end