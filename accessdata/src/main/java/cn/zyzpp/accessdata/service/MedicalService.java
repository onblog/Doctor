package cn.zyzpp.accessdata.service;

import cn.zyzpp.accessdata.medical.Medical;

public interface MedicalService {

    Medical findAllByName(String name);
}
