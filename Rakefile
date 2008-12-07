task :jsmin do
  system('util/jsmin_my_js.rb')
end

task :pull do
  system('git pull')
  Rake::Task[:jsmin].execute
end

task :cleanup do
  FileUtils.rm(Dir['./support/*.min.js'])
  FileUtils.rm(Dir['./**/*~'])
end

task :default => [:cleanup, :jsmin]
