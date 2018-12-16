package cn.zyzpp.util;

import java.io.File;

/**
 * 在windows和linux系统下均可正常使用
 * Create by yster@foxmail.com 2018/6/6/006 14:51
 */
public class ProjectPath {

    //public final static String classPath = System.getProperty("user.dir");//获取项目的根路径,此方法在tomcat容器中获取出错
    public final static String classPath;

    static {
        classPath = Thread.currentThread().getContextClassLoader().getResource("").getPath();

    }

    /**
     * 项目根目录
     */
    public static String getRootPath() {
        return RootPath("");
    }

    /**
     * 自定义追加路径
     */
    public static String getRootPath(String u_path) {
        return RootPath("/" + u_path);
    }

    /**
     * 私有处理方法
     */
    private static String RootPath(String u_path) {
        String rootPath = "";
        //windows下
        if ("\\".equals(File.separator)) {
            //System.out.println(classPath);
            rootPath = classPath + u_path;
            rootPath = rootPath.replaceAll("/", "\\\\");
            if (rootPath.substring(0, 1).equals("\\")) {
                rootPath = rootPath.substring(1);
            }
        }
        //linux下
        if ("/".equals(File.separator)) {
            //System.out.println(classPath);
            rootPath = classPath + u_path;
            rootPath = rootPath.replaceAll("\\\\", "/");
        }
        return rootPath;
    }

    //更多扩展方法任你发挥

}
