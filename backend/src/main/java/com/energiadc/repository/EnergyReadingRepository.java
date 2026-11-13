package com.energiadc.repository;

import com.energiadc.model.EnergyReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface EnergyReadingRepository extends JpaRepository<EnergyReading, Integer> {
    @Query("select coalesce(sum(r.energyTotalKwh), 0), coalesce(sum(r.energyItKwh), 0), count(r.id) " +
           "from EnergyReading r where r.datacenter.id = :dcId and r.measuredAt >= :start and r.measuredAt < :end")
    List<Object[]> summarize(@Param("dcId") Integer dcId, @Param("start") Instant start, @Param("end") Instant end);
    long countByDatacenter_Id(Integer id);
}
