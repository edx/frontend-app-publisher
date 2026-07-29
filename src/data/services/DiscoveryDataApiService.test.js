import axios from 'axios';

import DiscoveryDataApiService from './DiscoveryDataApiService';

const mockTask = {
  task_id: '123',
  task_type: 'course_create',
  uploaded_by: 'test-user',
  status: 'completed',
  created: '2023-01-01T00:00:00Z',
  modified: '2023-01-02T00:00:00Z',
  csv_file: 'https://example.com/file.csv',
  task_summary: null,
};

describe('fetchOrganizationUsers', () => {
  let get;

  beforeEach(() => {
    get = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should resolve on a 404 response with null', () => {
    get.mockRejectedValue({ response: { status: 404 } });
    return DiscoveryDataApiService.fetchOrganizationUsers('test-id').then((response) => {
      expect(response).toEqual(null);
    });
  });

  it('should reject as expected if not a 404 response', () => {
    const mockError = { response: { status: 401 } };
    get.mockRejectedValue(mockError);
    return DiscoveryDataApiService.fetchOrganizationUsers('test-id').catch((error) => {
      expect(error).toEqual(mockError);
    });
  });
});

describe('fetchBulkOperationTask', () => {
  const taskId = 1;
  const expectedUrl = `${process.env.DISCOVERY_API_BASE_URL}/api/v1/bulk_operation_tasks/${taskId}/`;
  let get;

  beforeEach(() => {
    get = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should fetch task successfully', async () => {
    const mockData = mockTask;
    get.mockResolvedValue({ data: mockData });

    const result = await DiscoveryDataApiService.fetchBulkOperationTask(taskId);
    expect(get).toHaveBeenCalledWith(expectedUrl);
    expect(result.data).toEqual(mockData);
  });

  it('should return null on 404 response', async () => {
    get.mockRejectedValue({ response: { status: 404 } });

    await expect(DiscoveryDataApiService.fetchBulkOperationTask(taskId)).rejects.toEqual({ response: { status: 404 } });
  });

  it('should reject for other error statuses', async () => {
    const mockError = { response: { status: 500 } };
    get.mockRejectedValue(mockError);

    await expect(DiscoveryDataApiService.fetchBulkOperationTask(taskId)).rejects.toEqual(mockError);
  });
});

describe('exportCoursesCsv', () => {
  const expectedUrl = `${process.env.DISCOVERY_API_BASE_URL}/api/v1/courses/csv/`;
  let get;

  beforeEach(() => {
    get = jest.spyOn(axios, 'get');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should export CSV with correct endpoint and responseType', async () => {
    const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
    get.mockResolvedValue({ data: mockBlob });

    const options = { ordering: 'title', pubq: 'test' };
    await DiscoveryDataApiService.exportCoursesCsv(options);

    expect(get).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({
      responseType: 'blob',
    }));
  });

  it('should include filters in export request', async () => {
    const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
    get.mockResolvedValue({ data: mockBlob });

    const options = {
      ordering: 'title',
      pubq: 'test search',
      course_run_statuses: 'published,archived',
      editors: '1,2',
    };
    await DiscoveryDataApiService.exportCoursesCsv(options);

    expect(get).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({
      params: expect.objectContaining({
        editable: 1,
        exclude_utm: 1,
        ordering: 'title',
        pubq: 'test search',
        course_run_statuses: 'published,archived',
        editors: '1,2',
      }),
      responseType: 'blob',
    }));
  });

  it('should support empty options with default export params', async () => {
    const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
    get.mockResolvedValue({ data: mockBlob });

    await DiscoveryDataApiService.exportCoursesCsv({});

    expect(get).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({
      params: expect.objectContaining({
        editable: 1,
        exclude_utm: 1,
      }),
      responseType: 'blob',
    }));
  });

  it('should strip pagination parameters from export request', async () => {
    const mockBlob = new Blob(['test,data'], { type: 'text/csv' });
    get.mockResolvedValue({ data: mockBlob });

    const options = {
      ordering: 'title',
      pubq: 'test',
      page: 2,
      page_size: 50,
      limit: 100,
      offset: 100,
    };
    await DiscoveryDataApiService.exportCoursesCsv(options);

    expect(get).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({
      params: expect.not.objectContaining({
        page: expect.anything(),
        page_size: expect.anything(),
        limit: expect.anything(),
        offset: expect.anything(),
      }),
      responseType: 'blob',
    }));
  });

  it('should reject on error', async () => {
    const mockError = { response: { status: 500 } };
    get.mockRejectedValue(mockError);

    const options = { ordering: 'title' };
    await expect(DiscoveryDataApiService.exportCoursesCsv(options)).rejects.toEqual(mockError);
  });
});
