package com.usiu.campusevents.security;

import com.usiu.campusevents.entity.User;
import com.usiu.campusevents.entity.enums.UserStatus;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final com.usiu.campusevents.entity.enums.Role role;
    private final UserStatus status;
    private final LocalDateTime expiresAt;

    private UserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.role = user.getRole();
        this.status = user.getStatus();
        this.expiresAt = user.getExpiresAt();
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(user);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.SUSPENDED;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE && !isOrganizerExpired();
    }

    public boolean isOrganizerExpired() {
        return role == com.usiu.campusevents.entity.enums.Role.CLUB_ORGANIZER
                && expiresAt != null
                && expiresAt.isBefore(java.time.LocalDateTime.now());
    }
}
