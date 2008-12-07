task :jsmin do
  `util/jsmin_my_js.rb`
end

task :commit => [:jsmin] do
  system('git commit -a')
end

task :pull do
  `git pull`
  Rake::Task[:jsmin].execute
end