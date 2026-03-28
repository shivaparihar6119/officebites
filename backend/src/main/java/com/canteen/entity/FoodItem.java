package com.canteen.entity;

import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "food_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "name", "vendor_id" })
})
@Data
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "Food name is required")
    @jakarta.validation.constraints.Size(min = 3, max = 100, message = "Food name must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_,&().'/]+$", message = "Food name can only contain letters, numbers, spaces, and basic punctuation (- _, & () . ' /)")
    @Column(nullable = false)
    private String name;

    @jakarta.validation.constraints.Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @jakarta.validation.constraints.NotNull(message = "Price is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @jakarta.validation.constraints.DecimalMax(value = "9999.99", message = "Price must be less than 10000")
    @Column(nullable = false)
    private Double price;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    // Nutritional Values per serving
    @jakarta.validation.constraints.NotNull(message = "Calories are required")
    @jakarta.validation.constraints.Min(value = 1, message = "Calories must be at least 1")
    @jakarta.validation.constraints.Max(value = 5000, message = "Calories cannot exceed 5000")
    @Column(nullable = false)
    private Integer calories;

    @jakarta.validation.constraints.NotNull(message = "Protein content is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.0", message = "Protein cannot be negative")
    @jakarta.validation.constraints.DecimalMax(value = "500.0", message = "Protein cannot exceed 500g")
    @Column(nullable = false)
    private Double protein;

    @jakarta.validation.constraints.NotNull(message = "Carbohydrates content is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.0", message = "Carbohydrates cannot be negative")
    @jakarta.validation.constraints.DecimalMax(value = "500.0", message = "Carbohydrates cannot exceed 500g")
    @Column(nullable = false)
    private Double carbohydrates;

    @jakarta.validation.constraints.NotNull(message = "Fats content is required")
    @jakarta.validation.constraints.DecimalMin(value = "0.0", message = "Fats cannot be negative")
    @jakarta.validation.constraints.DecimalMax(value = "500.0", message = "Fats cannot exceed 500g")
    @Column(nullable = false)
    private Double fats;

    @Column(nullable = false)
    private Boolean isActive = true;

    private Double averageRating = 0.0;
}
