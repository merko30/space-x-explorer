export type Launch = {
  id: string;
  name: string;
  date_utc: string;
  success?: boolean | null;
  image?: string | null;
};

export type FetchResult = {
  docs: Launch[];
  totalDocs: number;
};

export type FetchOptions = {
  page?: number;
  limit?: number;
  upcoming?: boolean | null;
  success?: boolean | null;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "name";
};

export type LaunchLinks = {
  mission_patch?: string | null;
  mission_patch_small?: string | null;
  patch?: {
    small?: string | null;
    large?: string | null;
  } | null;
  flickr?: {
    small?: Array<string | null> | null;
    original?: Array<string | null> | null;
  } | null;
  presskit?: string | null;
  webcast?: string | null;
  youtube_id?: string | null;
  article?: string | null;
  wikipedia?: string | null;
  reddit?: {
    campaign?: string | null;
    launch?: string | null;
    media?: string | null;
    recovery?: string | null;
  } | null;
};

export type LaunchQuery = {
  upcoming?: boolean;
  success?: boolean;
  name?: { $regex: string; $options: string };
  date_utc?: { $gte?: string; $lte?: string };
};

export type SpaceXLaunch = {
  id: string;
  name: string;
  date_utc: string;
  success?: boolean | null;
  flight_number?: number;
  date_unix?: number;
  date_local?: string;
  upcoming?: boolean;
  details?: string | null;
  rocket?: string | null;
  launchpad?: string | null;
  payloads?: string[] | null;
  cores?: Array<string> | null;
  links?: {
    mission_patch?: string | null;
    mission_patch_small?: string | null;
    patch?: {
      small?: string | null;
      large?: string | null;
    } | null;
    flickr?: {
      small?: Array<string | null> | null;
      original?: Array<string | null> | null;
    } | null;
    presskit?: string | null;
    webcast?: string | null;
    youtube_id?: string | null;
    article?: string | null;
    wikipedia?: string | null;
    reddit?: {
      campaign?: string | null;
      launch?: string | null;
      media?: string | null;
      recovery?: string | null;
    } | null;
  } | null;
};

export type SpaceXLaunchResponse = {
  docs: SpaceXLaunch[];
  totalDocs?: number;
};

export type SpaceXRocket = {
  id: string;
  name: string;
  type?: string | null;
  flickr_images?: string[] | null;
  description?: string | null;
};

export type SpaceXLaunchpad = {
  id: string;
  name: string;
  locality?: string | null;
  region?: string | null;
  details?: string | null;
};
