package com.canteen.controller;

import com.canteen.entity.FoodItem;
import com.canteen.entity.GoalType;
import com.canteen.entity.Gender;
import com.canteen.entity.HealthGoal;
import com.canteen.entity.Role;
import com.canteen.entity.User;
import com.canteen.repository.FoodItemRepository;
import com.canteen.repository.HealthGoalRepository;
import com.canteen.repository.UserRepository;
import com.canteen.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {

    private final HealthGoalRepository healthGoalRepository;
    private final RecommendationService recommendationService;
    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;

    @PostMapping("/health-goal")
    public ResponseEntity<?> setHealthGoal(Authentication auth, @Valid @RequestBody HealthGoal healthGoal) {
        Optional<User> empOpt = userRepository.findByUsername(auth.getName());
        if (empOpt.isEmpty() || empOpt.get().getRole() != Role.EMPLOYEE) {
            return ResponseEntity.status(403).body("Access denied");
        }
        User employee = empOpt.get();
        // Logical Validation
        if (healthGoal.getGoalType() == GoalType.WEIGHT_LOSS && healthGoal.getTargetWeight() != null && healthGoal.getCurrentWeight() != null) {
            if (healthGoal.getTargetWeight() >= healthGoal.getCurrentWeight()) {
                return ResponseEntity.badRequest().body("For weight loss, target weight must be less than current weight");
            }
        }
        if (healthGoal.getGoalType() == GoalType.MUSCLE_GAIN && healthGoal.getTargetWeight() != null && healthGoal.getCurrentWeight() != null) {
            if (healthGoal.getTargetWeight() <= healthGoal.getCurrentWeight()) {
                return ResponseEntity.badRequest().body("For muscle gain, target weight must be greater than current weight");
            }
        }

        // Update if exists
        Optional<HealthGoal> existing = healthGoalRepository.findByEmployeeId(employee.getId());
        HealthGoal goal = existing.orElse(new HealthGoal());
        goal.setEmployee(employee);
        goal.setGoalType(healthGoal.getGoalType());
        goal.setCurrentWeight(healthGoal.getCurrentWeight());
        goal.setTargetWeight(healthGoal.getTargetWeight());
        goal.setHeight(healthGoal.getHeight());
        goal.setAge(healthGoal.getAge());
        goal.setGender(healthGoal.getGender());

        // Calculate BMR
        double bmr = 2000; // default
        if (goal.getCurrentWeight() != null && goal.getHeight() != null && goal.getAge() != null && goal.getGender() != null) {
            if (goal.getGender() == Gender.MALE) {
                bmr = 10 * goal.getCurrentWeight() + 6.25 * goal.getHeight() - 5 * goal.getAge() + 5;
            } else if (goal.getGender() == Gender.FEMALE) {
                bmr = 10 * goal.getCurrentWeight() + 6.25 * goal.getHeight() - 5 * goal.getAge() - 161;
            } else {
                bmr = 10 * goal.getCurrentWeight() + 6.25 * goal.getHeight() - 5 * goal.getAge() - 78; // Approximate for other
            }
        }

        // TDEE estimation (Assume lightly active)
        double tdee = bmr * 1.375;

        // Adjust based on goal
        if (goal.getGoalType() == GoalType.WEIGHT_LOSS) {
            goal.setTargetDailyCalories((int) (tdee - 500));
            goal.setTargetDailyProtein(goal.getCurrentWeight() != null ? goal.getCurrentWeight() * 2.0 : 100.0);
        } else if (goal.getGoalType() == GoalType.MUSCLE_GAIN) {
            goal.setTargetDailyCalories((int) (tdee + 500));
            goal.setTargetDailyProtein(goal.getCurrentWeight() != null ? goal.getCurrentWeight() * 2.2 : 150.0);
        } else {
            goal.setTargetDailyCalories((int) tdee);
            goal.setTargetDailyProtein(goal.getCurrentWeight() != null ? goal.getCurrentWeight() * 1.6 : 120.0);
        }

        return ResponseEntity.ok(healthGoalRepository.save(goal));
    }

    @GetMapping("/health-goal")
    public ResponseEntity<?> getMyHealthGoal(Authentication auth) {
        Optional<User> empOpt = userRepository.findByUsername(auth.getName());
        if (empOpt.isEmpty()) return ResponseEntity.status(403).build();
        Optional<HealthGoal> goal = healthGoalRepository.findByEmployeeId(empOpt.get().getId());
        return goal.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<FoodItem>> getRecommendedFoodItems(Authentication auth) {
        Optional<User> empOpt = userRepository.findByUsername(auth.getName());
        if (empOpt.isEmpty()) return ResponseEntity.status(403).build();
        List<FoodItem> recommendations = recommendationService.getRecommendationsForEmployee(empOpt.get().getId());
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        Optional<User> empOpt = userRepository.findByUsername(auth.getName());
        if (empOpt.isEmpty()) return ResponseEntity.status(404).build();
        User user = empOpt.get();
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "fullName", user.getFullName() != null ? user.getFullName() : "",
            "email", user.getEmail() != null ? user.getEmail() : "",
            "role", user.getRole().name()
        ));
    }
}
