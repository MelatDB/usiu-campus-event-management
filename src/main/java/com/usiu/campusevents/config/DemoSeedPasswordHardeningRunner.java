package com.usiu.campusevents.config;

import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.demo", name = "seed-password-hardening-enabled", havingValue = "true", matchIfMissing = true)
public class DemoSeedPasswordHardeningRunner implements ApplicationRunner {

    private static final String NOOP_PREFIX = "{noop}";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (User user : userRepository.findByPasswordStartingWith(NOOP_PREFIX)) {
            String demoPassword = user.getPassword().substring(NOOP_PREFIX.length());
            user.setPassword(passwordEncoder.encode(demoPassword));
        }
    }
}
