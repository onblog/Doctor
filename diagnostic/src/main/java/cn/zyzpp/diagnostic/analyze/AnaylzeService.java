package cn.zyzpp.diagnostic.analyze;

import cn.zyzpp.diagnostic.entity.Medical;
import cn.zyzpp.diagnostic.entity.Parameter;

import java.util.List;

public interface AnaylzeService {
    List<Medical> makeAnaylze(Parameter parameter);
}
