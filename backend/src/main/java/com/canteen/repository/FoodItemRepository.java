package com.canteen.repository;

import com.canteen.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByVendorId(Long vendorId);
    boolean existsByNameIgnoreCaseAndVendorId(String name, Long vendorId);
    boolean existsByNameIgnoreCaseAndVendorIdAndIdNot(String name, Long vendorId, Long id);
}
