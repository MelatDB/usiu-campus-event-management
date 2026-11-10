package com.usiu.campusevents.service.impl;

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
import com.usiu.campusevents.entity.EventCategory;
import com.usiu.campusevents.entity.Program;
import com.usiu.campusevents.entity.School;
import com.usiu.campusevents.entity.StudentClub;
import com.usiu.campusevents.entity.Venue;
import com.usiu.campusevents.exception.BadRequestException;
import com.usiu.campusevents.exception.ResourceNotFoundException;
import com.usiu.campusevents.mapper.CampusMapper;
import com.usiu.campusevents.repository.EventCategoryRepository;
import com.usiu.campusevents.repository.ProgramRepository;
import com.usiu.campusevents.repository.SchoolRepository;
import com.usiu.campusevents.repository.StudentClubRepository;
import com.usiu.campusevents.repository.VenueRepository;
import com.usiu.campusevents.service.interfaces.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CatalogServiceImpl implements CatalogService {

    private final SchoolRepository schoolRepository;
    private final ProgramRepository programRepository;
    private final StudentClubRepository clubRepository;
    private final EventCategoryRepository categoryRepository;
    private final VenueRepository venueRepository;
    private final CampusMapper mapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public SchoolResponse createSchool(SchoolRequest request) {
        if (schoolRepository.existsByAbbreviationIgnoreCase(request.abbreviation())
                || schoolRepository.existsBySchoolNameIgnoreCase(request.schoolName())) {
            throw new BadRequestException("School name or abbreviation already exists");
        }
        School school = School.builder()
                .schoolName(request.schoolName())
                .abbreviation(request.abbreviation())
                .description(request.description())
                .build();
        return mapper.toSchoolResponse(schoolRepository.save(school));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public SchoolResponse updateSchool(Long id, SchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School", id));
        school.setSchoolName(request.schoolName());
        school.setAbbreviation(request.abbreviation());
        school.setDescription(request.description());
        return mapper.toSchoolResponse(school);
    }

    @Override
    @Transactional(readOnly = true)
    public SchoolResponse getSchool(Long id) {
        return schoolRepository.findById(id)
                .map(mapper::toSchoolResponse)
                .orElseThrow(() -> new ResourceNotFoundException("School", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SchoolResponse> listSchools(Pageable pageable) {
        return PageResponse.from(schoolRepository.findAll(pageable).map(mapper::toSchoolResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void deleteSchool(Long id) {
        ensureExists(schoolRepository.existsById(id), "School", id);
        schoolRepository.deleteById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ProgramResponse createProgram(ProgramRequest request) {
        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School", request.schoolId()));
        if (programRepository.existsByProgramNameIgnoreCaseAndSchoolId(request.programName(), school.getId())) {
            throw new BadRequestException("Program already exists in this school");
        }
        Program program = Program.builder()
                .programName(request.programName())
                .description(request.description())
                .school(school)
                .build();
        return mapper.toProgramResponse(programRepository.save(program));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ProgramResponse updateProgram(Long id, ProgramRequest request) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
        School school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School", request.schoolId()));
        program.setProgramName(request.programName());
        program.setDescription(request.description());
        program.setSchool(school);
        return mapper.toProgramResponse(program);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramResponse getProgram(Long id) {
        return programRepository.findById(id)
                .map(mapper::toProgramResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProgramResponse> listPrograms(Long schoolId, Pageable pageable) {
        return PageResponse.from((schoolId == null ? programRepository.findAll(pageable) : programRepository.findBySchoolId(schoolId, pageable))
                .map(mapper::toProgramResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void deleteProgram(Long id) {
        ensureExists(programRepository.existsById(id), "Program", id);
        programRepository.deleteById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ClubResponse createClub(ClubRequest request) {
        if (clubRepository.existsByClubNameIgnoreCase(request.clubName())) {
            throw new BadRequestException("Club already exists");
        }
        StudentClub club = StudentClub.builder()
                .clubName(request.clubName())
                .description(request.description())
                .advisorName(request.advisorName())
                .logo(request.logo())
                .createdDate(request.createdDate() == null ? LocalDate.now() : request.createdDate())
                .status(request.status())
                .build();
        return mapper.toClubResponse(clubRepository.save(club));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ClubResponse updateClub(Long id, ClubRequest request) {
        StudentClub club = clubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));
        club.setClubName(request.clubName());
        club.setDescription(request.description());
        club.setAdvisorName(request.advisorName());
        club.setLogo(request.logo());
        club.setCreatedDate(request.createdDate() == null ? club.getCreatedDate() : request.createdDate());
        club.setStatus(request.status());
        return mapper.toClubResponse(club);
    }

    @Override
    @Transactional(readOnly = true)
    public ClubResponse getClub(Long id) {
        return clubRepository.findById(id)
                .map(mapper::toClubResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Club", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ClubResponse> listClubs(Pageable pageable) {
        return PageResponse.from(clubRepository.findAll(pageable).map(mapper::toClubResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void deleteClub(Long id) {
        ensureExists(clubRepository.existsById(id), "Club", id);
        clubRepository.deleteById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByCategoryNameIgnoreCase(request.categoryName())) {
            throw new BadRequestException("Event category already exists");
        }
        EventCategory category = EventCategory.builder()
                .categoryName(request.categoryName())
                .description(request.description())
                .build();
        return mapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event category", id));
        category.setCategoryName(request.categoryName());
        category.setDescription(request.description());
        return mapper.toCategoryResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(Long id) {
        return categoryRepository.findById(id)
                .map(mapper::toCategoryResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Event category", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CategoryResponse> listCategories(Pageable pageable) {
        return PageResponse.from(categoryRepository.findAll(pageable).map(mapper::toCategoryResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void deleteCategory(Long id) {
        ensureExists(categoryRepository.existsById(id), "Event category", id);
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public VenueResponse createVenue(VenueRequest request) {
        if (venueRepository.existsByBuildingIgnoreCaseAndRoomNumberIgnoreCase(request.building(), request.roomNumber())) {
            throw new BadRequestException("Venue building and room combination already exists");
        }
        Venue venue = Venue.builder()
                .venueName(request.venueName())
                .building(request.building())
                .roomNumber(request.roomNumber())
                .capacity(request.capacity())
                .availabilityStatus(request.availabilityStatus())
                .build();
        return mapper.toVenueResponse(venueRepository.save(venue));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public VenueResponse updateVenue(Long id, VenueRequest request) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", id));
        venue.setVenueName(request.venueName());
        venue.setBuilding(request.building());
        venue.setRoomNumber(request.roomNumber());
        venue.setCapacity(request.capacity());
        venue.setAvailabilityStatus(request.availabilityStatus());
        return mapper.toVenueResponse(venue);
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse getVenue(Long id) {
        return venueRepository.findById(id)
                .map(mapper::toVenueResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Venue", id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VenueResponse> listVenues(Pageable pageable) {
        return PageResponse.from(venueRepository.findAll(pageable).map(mapper::toVenueResponse));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public void deleteVenue(Long id) {
        ensureExists(venueRepository.existsById(id), "Venue", id);
        venueRepository.deleteById(id);
    }

    private void ensureExists(boolean exists, String resource, Long id) {
        if (!exists) {
            throw new ResourceNotFoundException(resource, id);
        }
    }
}
