package com.usiu.campusevents.service.interfaces;

import com.usiu.campusevents.dto.request.CategoryRequest;
import com.usiu.campusevents.dto.request.ClubRequest;
import com.usiu.campusevents.dto.request.ProgramRequest;
import com.usiu.campusevents.dto.request.SchoolRequest;
import com.usiu.campusevents.dto.request.VenueRequest;
import com.usiu.campusevents.dto.response.CategoryResponse;
import com.usiu.campusevents.dto.response.ClubResponse;
import com.usiu.campusevents.dto.response.PageResponse;
import com.usiu.campusevents.dto.response.ProgramResponse;
import com.usiu.campusevents.dto.response.SchoolResponse;
import com.usiu.campusevents.dto.response.VenueResponse;
import org.springframework.data.domain.Pageable;

public interface CatalogService {

    SchoolResponse createSchool(SchoolRequest request);

    SchoolResponse updateSchool(Long id, SchoolRequest request);

    SchoolResponse getSchool(Long id);

    PageResponse<SchoolResponse> listSchools(Pageable pageable);

    void deleteSchool(Long id);

    ProgramResponse createProgram(ProgramRequest request);

    ProgramResponse updateProgram(Long id, ProgramRequest request);

    ProgramResponse getProgram(Long id);

    PageResponse<ProgramResponse> listPrograms(Long schoolId, Pageable pageable);

    void deleteProgram(Long id);

    ClubResponse createClub(ClubRequest request);

    ClubResponse updateClub(Long id, ClubRequest request);

    ClubResponse getClub(Long id);

    PageResponse<ClubResponse> listClubs(Pageable pageable);

    void deleteClub(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    CategoryResponse getCategory(Long id);

    PageResponse<CategoryResponse> listCategories(Pageable pageable);

    void deleteCategory(Long id);

    VenueResponse createVenue(VenueRequest request);

    VenueResponse updateVenue(Long id, VenueRequest request);

    VenueResponse getVenue(Long id);

    PageResponse<VenueResponse> listVenues(Pageable pageable);

    void deleteVenue(Long id);
}
