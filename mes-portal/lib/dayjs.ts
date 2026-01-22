'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

dayjs.locale('ko')

export default dayjs
export { Dayjs } from 'dayjs'
