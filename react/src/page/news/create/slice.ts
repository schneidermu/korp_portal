import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import * as R from "radashi";
import { Temporal } from "temporal-polyfill";

import { RootState, useAppSelector } from "@app/store";

import { NEWS_MAX_IMGS_SIZE } from "@app/const";
import { Attachment } from "@api/common/types";
import { fileToDataURL } from "@util/file";

import * as api from "@api/news";
import { NewsCreateInfo } from "@api/news/types";

export interface State {
  info: NewsCreateInfo;
  publishing: boolean;
  publishedId: number | null;
}

const initialState: State = {
  info: {
    title: "",
    datetime: "",
    text: "",
    imgs: [],
  },
  publishing: false,
  publishedId: null,
};

export const NAME = "v2/news/create";

export const slice = createSlice({
  name: NAME,
  initialState: initialState as State,
  reducers: {
    cleared(state) {
      freeImgs(state.info.imgs);
      return initialState;
    },
    edited(
      state,
      { payload }: PayloadAction<Partial<Omit<NewsCreateInfo, "imgs">>>,
    ) {
      Object.assign(state.info, payload);
    },
    imgAttached(state, { payload: img }: PayloadAction<Attachment>) {
      state.info.imgs.push(img);
    },
    imgRemoved(state, { payload: idx }: PayloadAction<number>) {
      const { dataURL } = state.info.imgs[idx];
      state.info.imgs.splice(idx, 1);
      URL.revokeObjectURL(dataURL);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(publishNews.pending, (state) => {
        state.publishing = true;
      })
      .addCase(publishNews.fulfilled, (state, { payload }) => {
        state.publishing = false;
        state.publishedId = payload.id;
      })
      .addCase(publishNews.rejected, () => {});
  },
});

export const useSliceSelector = <T>(select: (state: State) => T): T =>
  useAppSelector((state) => select(state[NAME]));

export const useInfoSelector = <T>(select: (info: State["info"]) => T): T =>
  useAppSelector((state) => select(state[NAME].info));

const totalImgsSize = (imgs: Attachment[]) => R.sum(imgs, (img) => img.size);

const freeImgs = (imgs: Attachment[]) =>
  imgs.forEach((img) => URL.revokeObjectURL(img.dataURL));

export const attachImgs = createAsyncThunk(
  `${NAME}/attachImgs`,
  async (fs: File[], thunkAPI) => {
    const { [NAME]: state } = thunkAPI.getState() as RootState;

    const imgs: (Attachment | null)[] = await Promise.all(
      fs.map(async (f) => {
        const dataURL = await fileToDataURL(f);
        if (dataURL === null) {
          return null;
        }

        return {
          name: f.name,
          size: f.size,
          dataURL,
        };
      }),
    );

    for (const img of imgs) {
      if (img !== null) {
        if (img.size + totalImgsSize(state.info.imgs) > NEWS_MAX_IMGS_SIZE) {
          // TODO: proper error class
          throw new Error("maximum attachment size reached");
        }
        thunkAPI.dispatch(actions.imgAttached(img));
      }
    }
  },
);

export const publishNews = createAsyncThunk(
  `${NAME}/publish`,
  async (_, thunkAPI) => {
    const { auth, [NAME]: state } = thunkAPI.getState() as RootState;

    const info = { ...state.info };

    if (info.datetime) {
      info.datetime = Temporal.PlainDateTime.from(info.datetime)
        .toZonedDateTime(Temporal.Now.timeZoneId())
        .toString({ timeZoneName: "never" });
    } else {
      info.datetime = Temporal.Now.zonedDateTimeISO().toString({
        timeZoneName: "never",
      });
    }

    const news = await api.publishNews(auth, info);
    freeImgs(state.info.imgs);
    return news;
  },
);

export default slice;
export const actions = slice.actions;
