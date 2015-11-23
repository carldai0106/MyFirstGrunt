module.exports = function(grunt) {

	// LiveReload的默认端口号，你也可以改成你想要的端口号
	var lrPort = 35729;
	// 使用connect-livereload模块，生成一个与LiveReload脚本
	// <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
	var lrSnippet = require('connect-livereload')({
		port: lrPort
	});
	// 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
	var lrMiddleware = function(connect, options) {
		return [
			// 把脚本，注入到静态文件中
			lrSnippet,
			// 静态文件服务器的路径
			connect.static(options.base[0]),
			// 启用目录浏览(相当于IIS中的目录浏览)
			connect.directory(options.base[0])
		];
	};

	// 项目配置(任务配置)
	grunt.initConfig({
		// 读取我们的项目配置并存储到pkg属性中
		pkg: grunt.file.readJSON('package.json'),
		// sass: {
		// 	output: {
		// 		options: {
		// 			style: 'expanded'
		// 		},
		// 		files: [{
		// 			expand: true,
		// 			cwd: 'scss',
		// 			src: ['*.scss'],
		// 			dest: 'scss/styles',
		// 			ext: '.css'
		// 		}]
		// 	}
		// },
		less: {
			development: {
				files: [{
					expand: true,
					cwd: 'less',
					src: ['**/*.less'],
					dest: 'css',
					ext: '.css'
				}]
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/**/*.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				//添加文字到压缩后的文件尾部
				footer: '\n/*! 这是压缩文件尾部 */',
				//美化代码
				beautify: {
					//中文ascii化，非常有用！防止中文乱码的神配置
					ascii_only: true
				}
			},
			// build: {
			// 	src: 'src/<%= pkg.name %>.js',
			// 	dest: 'build/<%= pkg.name %>.min.js'
			// }
			// buildall 表示一个任务
			buildall: {
				options: {
					mangle: true, //不混淆变量名
					//preserveComments: 'all', //不删除注释，还可以为 false（删除全部注释），some（保留@preserve @license @cc_on等注释）
					compress: {
						drop_console: true
					},
					report: "min" //输出压缩率，可选的值有 false(不输出信息)，gzip
				},
				files: [{
					expand: true, //是否启用下面选项
					cwd: 'src', //js目录下
					src: '**/*.js', //所有js文件
					dest: 'dist' //输出到此目录下
				}]
			}
		},
		jshint: {
			files: ['src/**/*.js'], //['src/**/*.js', 'test/**/*.js'], //检测的目标文件数组
			options: {
				// curly:true,//大括号包裹
				//             eqeqeq:true,//对于简单类型，使用===和!==，而不是==和!=
				//             newcap:true,//对于首字母大写的函数（声明的类），强制使用new
				//             noarg:true,//禁用arguments.caller和arguments.callee
				//             boss:true,//对于属性使用aaa.bbb而不是aaa['bbb']sub:true,//查找所有未定义变量undef:true,//查找类似与if(a = 0)这样的代码
				//             node:true,//指定运行环境为node.js
				//覆盖默认配置
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},

		// 通过connect任务，创建一个静态服务器
		connect: {
			options: {
				// 服务器端口号
				port: 9000,
				// 服务器地址(可以使用主机名localhost，也能使用IP)
				hostname: 'localhost',
				// 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
				base: '.'
			},
			livereload: {
				options: {
					// 通过LiveReload脚本，让页面重新加载。
					middleware: lrMiddleware
				}
			}
		},
		watch: {
			scripts: {
				files: ['src/**/*.js'],
				//tasks: ['minall'],
				tasks: ['jshint', 'uglify:buildall'],
				options: {
					spawn: true,
					interrupt: true
				}
			},
			less: {
				files: ['less/*.less'],
				tasks: ['less']
			},
			client: {
				options: {
					livereload: lrPort
				},
				files: ['*.html', 'css/*', 'dist/*', 'images/**/*'],
			}
		}
	});


	//grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

	//grunt.registerTask('outputcss', ['sass']);
	grunt.registerTask('outputcss', ['less']);
	grunt.registerTask('concatjs', ['concat']);
	grunt.registerTask('compressjs', ['concat', 'jshint', 'uglify']);
	grunt.registerTask('watchit', ['less', 'concat', 'jshint', 'uglify', 'connect', 'watch']);
	grunt.registerTask('live', ['connect', 'watch']);
	grunt.registerTask('default');

	// grunt.loadNpmTasks('grunt-contrib-sass');
	// grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-jshint');
	// grunt.loadNpmTasks('grunt-contrib-qunit');
	// grunt.loadNpmTasks('grunt-contrib-watch');
	// grunt.loadNpmTasks('grunt-contrib-concat');
	// grunt.loadNpmTasks('grunt-contrib-connect');

	// grunt.registerTask('minall', ['uglify:buildall']);
	// grunt.registerTask('unittest', ['connect', 'qunit']);
	// grunt.registerTask('test', ['jshint', 'qunit']);
	// grunt.registerTask('full', ['jshint', 'qunit', 'concat', 'uglify']);
	// grunt.registerTask('default', ['concat', 'uglify', 'sass']);
}
