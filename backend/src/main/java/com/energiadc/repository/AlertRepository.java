package com.energiadc.repository;

import com.energiadc.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Integer> {
    @Query("select a from Alert a join fetch a.reading r where r.datacenter.id = :dcId order by r.measuredAt desc, a.id desc")
    List<Alert> findByDatacenter(@Param("dcId") Integer dcId);
}
