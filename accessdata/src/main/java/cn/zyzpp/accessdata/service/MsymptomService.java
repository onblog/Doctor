package cn.zyzpp.accessdata.service;

import cn.zyzpp.accessdata.medical.Msymptom;

public interface MsymptomService {
    Msymptom findAllByName(String name);
}
