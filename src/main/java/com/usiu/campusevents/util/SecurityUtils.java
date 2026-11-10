package com.usiu.campusevents.util;

import com.usiu.campusevents.entity.enums.Role;
import com.usiu.campusevents.exception.UnauthorizedActionException;
import com.usiu.campusevents.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long currentUserId() {
        return currentPrincipal().getId();
    }

    public static UserPrincipal currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedActionException("Authenticated user context is required");
        }
        return principal;
    }

    public static boolean hasRole(Role role) {
        return currentPrincipal().getRole() == role;
    }

    public static void requireAnyRole(Role... roles) {
        Role actual = currentPrincipal().getRole();
        for (Role role : roles) {
            if (actual == role) {
                return;
            }
        }
        throw new UnauthorizedActionException("User does not have permission to perform this action");
    }
}
