import * as React from 'react';
import {
  Column,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { EmailLayout } from '../components/EmailLayout';

type ReservationCancelledEmailProps = {
  guestFirstName: string;
  reservationId: string;
  checkIn: string;
  checkOut: string;
  roomNames: string[];
  cancellationReason: string;
  previouslyPaidAmount: number;
  refundedAmount: number;
  retainedAmount: number;
  locale?: 'RO' | 'EN';
};

export function ReservationCancelledEmail({
  guestFirstName,
  reservationId,
  checkIn,
  checkOut,
  roomNames,
  cancellationReason,
  previouslyPaidAmount,
  refundedAmount,
  retainedAmount,
  locale = 'RO',
}: ReservationCancelledEmailProps) {
  const isRomanian = locale === 'RO';

  const hasPayment =
    previouslyPaidAmount > 0;

  const hasRefund =
    refundedAmount > 0;

  return (
    <EmailLayout
      preview={
        isRomanian
          ? 'Rezervarea dumneavoastră a fost anulată.'
          : 'Your reservation has been cancelled.'
      }
      title={
        isRomanian
          ? `Rezervarea a fost anulată, ${guestFirstName}`
          : `Your reservation has been cancelled, ${guestFirstName}`
      }
    >
      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Confirmăm anularea rezervării dumneavoastră la Sunshine Resort.'
          : 'We confirm that your Sunshine Resort reservation has been cancelled.'}
      </Text>

      <Text style={paragraphStyle}>
        {isRomanian
          ? 'Apartamentul rezervat a fost eliberat din disponibilitate, iar rezervarea nu mai este activă.'
          : 'The reserved apartment has been released back into availability, and the reservation is no longer active.'}
      </Text>

      <Section style={detailsCardStyle}>
        <Text style={detailsHeadingStyle}>
          {isRomanian
            ? 'Detaliile rezervării anulate'
            : 'Cancelled reservation details'}
        </Text>

        <Hr style={dividerStyle} />

        <DetailRow
          label={
            isRomanian
              ? 'Număr rezervare'
              : 'Reservation number'
          }
          value={reservationId}
        />

        <DetailRow
          label="Check-in"
          value={`${formatDate(
            checkIn,
            locale,
          )} · 14:00`}
        />

        <DetailRow
          label="Check-out"
          value={`${formatDate(
            checkOut,
            locale,
          )} · 10:00`}
        />

        <DetailRow
          label={
            isRomanian
              ? 'Cazare'
              : 'Accommodation'
          }
          value={roomNames.join(', ')}
        />
      </Section>

      <Section style={reasonCardStyle}>
        <Text style={reasonTitleStyle}>
          {isRomanian
            ? 'Motivul anulării'
            : 'Cancellation reason'}
        </Text>

        <Text style={reasonTextStyle}>
          {cancellationReason}
        </Text>
      </Section>

      {hasPayment ? (
        <Section style={financialCardStyle}>
          <Text style={financialTitleStyle}>
            {isRomanian
              ? 'Situația financiară'
              : 'Payment summary'}
          </Text>

          <Hr style={dividerStyle} />

          <DetailRow
            label={
              isRomanian
                ? 'Sumă achitată anterior'
                : 'Previously paid'
            }
            value={formatCurrency(
              previouslyPaidAmount,
              locale,
            )}
          />

          <DetailRow
            label={
              isRomanian
                ? 'Sumă rambursată'
                : 'Refunded amount'
            }
            value={formatCurrency(
              refundedAmount,
              locale,
            )}
          />

          <DetailRow
            label={
              isRomanian
                ? 'Sumă reținută'
                : 'Retained amount'
            }
            value={formatCurrency(
              retainedAmount,
              locale,
            )}
          />
        </Section>
      ) : null}

      {hasRefund ? (
        <Section style={refundNoticeStyle}>
          <Text style={refundNoticeTitleStyle}>
            {isRomanian
              ? 'Rambursarea a fost inițiată'
              : 'Your refund has been initiated'}
          </Text>

          <Text style={refundNoticeTextStyle}>
            {isRomanian
              ? 'Suma rambursată a fost transmisă către procesatorul de plăți. În funcție de banca emitentă, aceasta poate deveni vizibilă în cont în câteva zile lucrătoare.'
              : 'The refund has been submitted to the payment processor. Depending on your bank, it may take several business days to appear in your account.'}
          </Text>
        </Section>
      ) : (
        <Section style={standardNoticeStyle}>
          <Text style={standardNoticeTextStyle}>
            {isRomanian
              ? hasPayment
                ? 'Conform politicii de anulare aplicabile rezervării, nu a fost inițiată nicio rambursare suplimentară.'
                : 'Pentru această rezervare nu exista nicio plată înregistrată.'
              : hasPayment
                ? 'Under the cancellation policy applicable to this reservation, no additional refund was initiated.'
                : 'No payment had been recorded for this reservation.'}
          </Text>
        </Section>
      )}

      <Text style={closingStyle}>
        {isRomanian
          ? 'Sperăm să avem ocazia să vă găzduim la Sunshine Resort într-o altă perioadă.'
          : 'We hope to have the opportunity to welcome you to Sunshine Resort on another occasion.'}
      </Text>
    </EmailLayout>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({
  label,
  value,
}: DetailRowProps) {
  return (
    <Row style={detailRowStyle}>
      <Column style={labelColumnStyle}>
        <Text style={detailLabelStyle}>
          {label}
        </Text>
      </Column>

      <Column style={valueColumnStyle}>
        <Text style={detailValueStyle}>
          {value}
        </Text>
      </Column>
    </Row>
  );
}

function formatDate(
  value: string,
  locale: 'RO' | 'EN',
): string {
  const normalizedValue = value.slice(0, 10);

  const date = new Date(
    `${normalizedValue}T00:00:00.000Z`,
  );

  return new Intl.DateTimeFormat(
    locale === 'RO'
      ? 'ro-RO'
      : 'en-GB',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    },
  ).format(date);
}

function formatCurrency(
  value: number,
  locale: 'RO' | 'EN',
): string {
  return new Intl.NumberFormat(
    locale === 'RO'
      ? 'ro-RO'
      : 'en-GB',
    {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: '#d0cbc2',
  fontSize: '16px',
  lineHeight: '29px',
};

const detailsCardStyle: React.CSSProperties = {
  marginTop: '32px',
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const detailsHeadingStyle: React.CSSProperties = {
  margin: 0,
  color: '#d4af37',
  fontSize: '17px',
  fontWeight: 700,
  letterSpacing: '0.5px',
};

const dividerStyle: React.CSSProperties = {
  margin: '18px 0 10px',
  borderColor: '#302c25',
};

const detailRowStyle: React.CSSProperties = {
  width: '100%',
};

const labelColumnStyle: React.CSSProperties = {
  width: '46%',
  verticalAlign: 'top',
};

const valueColumnStyle: React.CSSProperties = {
  width: '54%',
  verticalAlign: 'top',
};

const detailLabelStyle: React.CSSProperties = {
  margin: '9px 0',
  color: '#8f887c',
  fontSize: '13px',
  lineHeight: '20px',
};

const detailValueStyle: React.CSSProperties = {
  margin: '9px 0',
  color: '#f1ede6',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  textAlign: 'right',
};

const reasonCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '22px 24px',
  backgroundColor: '#1a1412',
  borderLeft: '3px solid #b98570',
};

const reasonTitleStyle: React.CSSProperties = {
  margin: '0 0 10px',
  color: '#d7b3a4',
  fontSize: '15px',
  fontWeight: 700,
};

const reasonTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#d0c6c0',
  fontSize: '14px',
  lineHeight: '24px',
  whiteSpace: 'pre-line',
};

const financialCardStyle: React.CSSProperties = {
  marginBottom: '28px',
  padding: '26px',
  backgroundColor: '#151515',
  border: '1px solid #2d2922',
  borderRadius: '8px',
};

const financialTitleStyle: React.CSSProperties = {
  margin: 0,
  color: '#d4af37',
  fontSize: '17px',
  fontWeight: 700,
};

const refundNoticeStyle: React.CSSProperties = {
  marginBottom: '30px',
  padding: '22px 24px',
  backgroundColor: '#18160f',
  borderLeft: '3px solid #d4af37',
};

const refundNoticeTitleStyle: React.CSSProperties = {
  margin: '0 0 9px',
  color: '#d4af37',
  fontSize: '15px',
  fontWeight: 700,
};

const refundNoticeTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#c9c2b7',
  fontSize: '14px',
  lineHeight: '24px',
};

const standardNoticeStyle: React.CSSProperties = {
  marginBottom: '30px',
  padding: '20px 22px',
  backgroundColor: '#151515',
  border: '1px solid #292929',
  borderRadius: '6px',
};

const standardNoticeTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#aaa39a',
  fontSize: '14px',
  lineHeight: '24px',
};

const closingStyle: React.CSSProperties = {
  margin: 0,
  color: '#a8a197',
  fontSize: '14px',
  lineHeight: '25px',
};

ReservationCancelledEmail.PreviewProps = {
  guestFirstName: 'Andrei',
  reservationId: 'SR-2026-0001',
  checkIn: '2026-09-07',
  checkOut: '2026-09-10',
  roomNames: ['Apartament Signature'],
  cancellationReason:
    'Clientul a solicitat anularea rezervării.',
  previouslyPaidAmount: 1200,
  refundedAmount: 1200,
  retainedAmount: 0,
  locale: 'RO' as const,
};