import { Controller, SuggestedPayment } from "./controller";
describe("controller", () => {
  describe("people", () => {
    test("the controller gives back a person id when creating a person", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();

      expect(personId).toStrictEqual(expect.any(String));
    });

    test("the controller allows removal of a person", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      controller.removePersonById(personId);

      expect(() => controller.getTotalDebtByPersonId(personId)).toThrow();
    });
  });
  describe("total spend", () => {
    test("the controller can tell me the total amount that someone has paid (0.00)", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      const paymentSet = new Set([
        { amount: 0, to: controller.addNewPerson() },
      ]);
      controller.addPaymentSetToPersonById(paymentSet, personId);

      expect(controller.getTotalSpendByPersonId(personId)).toBe(0.0);
    });

    test("the controller can tell me the total amount that someone has paid (1.57 - single payment) ", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      controller.addPaymentSetToPersonById(
        new Set([{ amount: 157, to: controller.addNewPerson() }]),
        personId
      );

      expect(controller.getTotalSpendByPersonId(personId)).toBe(157);
    });

    test("the controller can tell me the total amount that someone has paid (1.28 - single payment, two people) ", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      controller.addPaymentSetToPersonById(
        new Set([
          { amount: 29, to: controller.addNewPerson() },
          { amount: 99, to: controller.addNewPerson() },
        ]),
        personId
      );

      expect(controller.getTotalSpendByPersonId(personId)).toBe(128);
    });

    test("the controller can tell me the total amount that someone has paid (207 - two payments, two people) ", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();

      controller.addPaymentSetToPersonById(
        new Set([
          { amount: 29, to: controller.addNewPerson() },
          { amount: 99, to: controller.addNewPerson() },
        ]),
        personId
      );

      controller.addPaymentSetToPersonById(
        new Set([
          { amount: 56, to: controller.addNewPerson() },
          { amount: 23, to: controller.addNewPerson() },
        ]),
        personId
      );

      expect(controller.getTotalSpendByPersonId(personId)).toBe(207);
    });
    describe("errors", () => {
      test("the controller throws an PersonDoesNotExist error if the person id doesn't relate to a person when creating a payment", () => {
        const controller = new Controller();
        controller.addNewPerson();
        const paymentSet = new Set([
          { amount: 0, to: controller.addNewPerson() },
        ]);

        expect(() =>
          controller.addPaymentSetToPersonById(
            paymentSet,
            "some-non-existent-id"
          )
        ).toThrow(new Error("That person does not exist"));
      });

      test("the controller throws an PersonDoesNotExist error if the person id doesn't relate to a person when retrieving a persons total spend", () => {
        const controller = new Controller();
        const personId = controller.addNewPerson();
        const paymentSet = new Set([
          { amount: 0, to: controller.addNewPerson() },
        ]);
        controller.addPaymentSetToPersonById(paymentSet, personId);

        expect(() =>
          controller.getTotalSpendByPersonId("some-non-existent-id")
        ).toThrow(new Error("That person does not exist"));
      });
    });
  });

  describe("total debt", () => {
    test("the controller can tell me the total amount that someone is in debt (0.00)", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      const personOwedMoneyId = controller.addNewPerson();

      const paymentSet = new Set([{ amount: 0, to: personId }]);

      controller.addPaymentSetToPersonById(paymentSet, personOwedMoneyId);

      expect(controller.getTotalDebtByPersonId(personId)).toBe(0.0);
    });

    test("the controller can tell me the total amount that someone is in debt (5.27, single debt)", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      const personOwedMoneyId = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 527, to: personId }]);

      controller.addPaymentSetToPersonById(paymentSet, personOwedMoneyId);

      expect(controller.getTotalDebtByPersonId(personId)).toBe(527);
    });

    test("the controller can tell me the total amount that someone is in debt (8.88, tw debts)", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      const personOwedMoneyId = controller.addNewPerson();
      const secondPersonOwedMoneyId = controller.addNewPerson();

      const paymentSet = new Set([{ amount: 422, to: personId }]);

      const paymentSetTwo = new Set([{ amount: 466, to: personId }]);

      controller.addPaymentSetToPersonById(paymentSet, personOwedMoneyId);
      controller.addPaymentSetToPersonById(
        paymentSetTwo,
        secondPersonOwedMoneyId
      );

      expect(controller.getTotalDebtByPersonId(personId)).toBe(888);
    });

    test("the controller can tell me the separate amounts that people are in debt", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      const person2Id = controller.addNewPerson();
      const personOwedMoneyId = controller.addNewPerson();

      const paymentSet = new Set([
        { amount: 999, to: personId },
        { amount: 444, to: person2Id },
      ]);

      controller.addPaymentSetToPersonById(paymentSet, personOwedMoneyId);
      const allDebts = controller.getAllTotalDebts();

      expect(allDebts).toEqual([
        { personId, amount: 999 },
        { personId: person2Id, amount: 444 },
        { personId: personOwedMoneyId, amount: -1443 },
      ]);
    });

    test("the controller can tell me the separate amounts that a sub list of people are in debt", () => {
      const controller = new Controller();
      const personId = controller.addNewPerson();
      const person2Id = controller.addNewPerson();
      const personOwedMoneyId = controller.addNewPerson();

      const paymentSet = new Set([
        { amount: 999, to: personId },
        { amount: 444, to: person2Id },
      ]);

      controller.addPaymentSetToPersonById(paymentSet, personOwedMoneyId);
      const allDebts = controller.getDebtsForListOfIds([
        personId,
        personOwedMoneyId,
      ]);

      expect(allDebts).toEqual([
        { personId, amount: 999 },

        { personId: personOwedMoneyId, amount: -1443 },
      ]);
    });

    describe("errors", () => {
      test("the controller throws an PersonDoesNotExist error if the person id doesn't relate to a person when retrieving a persons total spend", () => {
        const controller = new Controller();
        const debtPayerId = controller.addNewPerson();
        const personOwedMoneyId = controller.addNewPerson();
        const paymentSet = new Set([{ amount: 527, to: debtPayerId }]);

        controller.addPaymentSetToPersonById(paymentSet, personOwedMoneyId);

        expect(() =>
          controller.getTotalDebtByPersonId("non-existent-debt-payer")
        ).toThrow(new Error("That person does not exist"));
      });
    });
  });

  describe("payment to debt linking", () => {
    test("if person A pays for person B person B owes person A the amount (5.73)", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 573, to: personBId }]);
      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personBId)).toBe(573);
    });

    test("if person A pays for person B twice person B owes person A the sum (6.66)", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 222, to: personBId }]);
      const paymentSet2 = new Set([{ amount: 444, to: personBId }]);
      controller.addPaymentSetToPersonById(paymentSet, personAId);
      controller.addPaymentSetToPersonById(paymentSet2, personAId);

      expect(controller.getTotalDebtByPersonId(personBId)).toBe(666);
    });

    test("if person A pays for person B and C person B and C owe person A the amount (1.23 and 3.21)", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const personCId = controller.addNewPerson();
      const paymentSet = new Set([
        { amount: 123, to: personBId },
        { amount: 321, to: personCId },
      ]);

      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personBId)).toBe(123);
      expect(controller.getTotalDebtByPersonId(personCId)).toBe(321);
    });

    test("if person A pays for person B and C person B and C owe person A the amount (1.23 and 3.21)", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const personCId = controller.addNewPerson();
      const paymentSet = new Set([
        { amount: 123, to: personBId },
        { amount: 321, to: personCId },
      ]);

      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personBId)).toBe(123);
      expect(controller.getTotalDebtByPersonId(personCId)).toBe(321);
    });

    test("if person A pays for person B and C person in two separate payments B and C owe person A the amount (1.23 and 3.21)", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const personCId = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 123, to: personBId }]);
      const paymentSet2 = new Set([{ amount: 321, to: personCId }]);

      controller.addPaymentSetToPersonById(paymentSet, personAId);
      controller.addPaymentSetToPersonById(paymentSet2, personAId);

      expect(controller.getTotalDebtByPersonId(personBId)).toBe(123);
      expect(controller.getTotalDebtByPersonId(personCId)).toBe(321);
    });

    test("if person A pays for person B person A's balance is 0", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 573, to: personBId }]);
      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personAId)).toBe(-573);
    });

    test("if person A pays for person B person B's balance is the amount", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 599, to: personBId }]);
      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personBId)).toBe(599);
    });

    test("a person cannot owe themselves", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();

      const paymentSet = new Set([
        {
          amount: 221,
          to: personAId,
        },
      ]);
      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personAId)).toBe(0);
    });

    test("a person is owed the proportion of the bill that wasn't for them", () => {
      const controller = new Controller();
      const personAId = controller.addNewPerson();
      const personBId = controller.addNewPerson();
      const paymentSet = new Set([
        {
          amount: 221,
          to: personAId,
        },
        {
          amount: 599,
          to: personBId,
        },
      ]);
      controller.addPaymentSetToPersonById(paymentSet, personAId);

      expect(controller.getTotalDebtByPersonId(personAId)).toBe(-599);
    });
  });
  describe("suggested payments", () => {
    test("no payments if no debt", () => {
      const controller = new Controller();
      controller.addNewPerson();
      controller.addNewPerson();

      const expectedSuggestedPayments: SuggestedPayment[] = [];
      const suggestedPayments = controller.getSuggestedPayments();
      expect(expectedSuggestedPayments).toEqual(suggestedPayments);
    });

    test("person b owes person a 5.84", () => {
      const controller = new Controller();
      const personA = controller.addNewPerson();
      const personB = controller.addNewPerson();
      const paymentSet = new Set([{ amount: 584, to: personB }]);

      controller.addPaymentSetToPersonById(paymentSet, personA);

      const expectedSuggestedPayments: SuggestedPayment[] = [
        { to: personA, amount: 584, from: personB },
      ];
      const suggestedPayments = controller.getSuggestedPayments();
      expect(expectedSuggestedPayments).toEqual(suggestedPayments);
    });

    test("person b owes person a 5.84 and person c owes person a 2.61", () => {
      const controller = new Controller();
      const personA = controller.addNewPerson();
      const personB = controller.addNewPerson();
      const personC = controller.addNewPerson();
      const paymentSet = new Set([
        { amount: 584, to: personB },
        { amount: 261, to: personC },
      ]);

      controller.addPaymentSetToPersonById(paymentSet, personA);

      const expectedSuggestedPayments: SuggestedPayment[] = [
        { to: personA, amount: 584, from: personB },
        { to: personA, amount: 261, from: personC },
      ];
      const suggestedPayments = controller.getSuggestedPayments();
      expect(expectedSuggestedPayments).toEqual(suggestedPayments);
    });

    test("person c owes person a 5.84 and person c owes person b 2.61", () => {
      const controller = new Controller();
      const personA = controller.addNewPerson();
      const personB = controller.addNewPerson();
      const personC = controller.addNewPerson();

      const paymentSet1 = new Set([{ amount: 584, to: personC }]);
      const paymentSet2 = new Set([{ amount: 261, to: personC }]);

      controller.addPaymentSetToPersonById(paymentSet1, personA);
      controller.addPaymentSetToPersonById(paymentSet2, personB);

      const expectedSuggestedPayments: SuggestedPayment[] = [
        { to: personA, amount: 584, from: personC },
        { to: personB, amount: 261, from: personC },
      ];
      const suggestedPayments = controller.getSuggestedPayments();

      expect(expectedSuggestedPayments).toEqual(suggestedPayments);
    });

    test("person c owes person a 5.84 and person c owes person b 2.61 and person d owes person b 1.00", () => {
      const controller = new Controller();
      const personA = controller.addNewPerson();
      const personB = controller.addNewPerson();
      const personC = controller.addNewPerson();
      const personD = controller.addNewPerson();

      const personAsPayment = new Set([{ amount: 584, to: personC }]);
      const personBsPayment = new Set([
        { amount: 261, to: personC },
        { amount: 100, to: personD },
      ]);

      controller.addPaymentSetToPersonById(personAsPayment, personA);
      controller.addPaymentSetToPersonById(personBsPayment, personB);

      const expectedSuggestedPayments: SuggestedPayment[] = [
        { to: personA, amount: 584, from: personC },
        { to: personB, amount: 261, from: personC },
        { to: personB, amount: 100, from: personD },
      ];
      const suggestedPayments = controller.getSuggestedPayments();

      expect(suggestedPayments).toEqual(expectedSuggestedPayments);
    });

    test("person c owes person a 5.84 and person c owes person b 2.61 and person d owes person b 1.00", () => {
      const controller = new Controller();
      const personA = controller.addNewPerson();
      const personB = controller.addNewPerson();
      const personC = controller.addNewPerson();
      const personD = controller.addNewPerson();
      const personE = controller.addNewPerson();

      const personAsPayment = new Set([
        { amount: 584, to: personC },
        { amount: 211, to: personE },
      ]);
      const personBsPayment = new Set([
        { amount: 261, to: personC },
        { amount: 100, to: personD },
      ]);

      controller.addPaymentSetToPersonById(personAsPayment, personA);
      controller.addPaymentSetToPersonById(personBsPayment, personB);

      const expectedSuggestedPayments: SuggestedPayment[] = [
        { to: personA, amount: 795, from: personC },
        { to: personB, amount: 50, from: personC },
        { to: personB, amount: 211, from: personE },
        { to: personB, amount: 100, from: personD },
      ];
      const suggestedPayments = controller.getSuggestedPayments();

      expect(suggestedPayments).toEqual(expectedSuggestedPayments);
    });

    test("B owes A, C owes B, D owes C, A owes D", () => {
      const controller = new Controller();
      const A = controller.addNewPerson();
      const B = controller.addNewPerson();
      const C = controller.addNewPerson();
      const D = controller.addNewPerson();

      const paymentSetA = new Set([{ amount: 500, to: B }]);
      const paymentSetB = new Set([{ amount: 1000, to: C }]);
      const paymentSetC = new Set([{ amount: 1500, to: D }]);
      const paymentSetD = new Set([{ amount: 2000, to: A }]);

      controller.addPaymentSetToPersonById(paymentSetA, A);
      controller.addPaymentSetToPersonById(paymentSetB, B);
      controller.addPaymentSetToPersonById(paymentSetC, C);
      controller.addPaymentSetToPersonById(paymentSetD, D);

      const expectedSuggestedPayments: SuggestedPayment[] = [
        { to: B, amount: 500, from: A },
        { to: C, amount: 500, from: A },
        { to: D, amount: 500, from: A },
      ];
      const suggestedPayments = controller.getSuggestedPayments();

      expect(suggestedPayments).toEqual(expectedSuggestedPayments);
    });

    test("large number of payments", () => {
      const controller = new Controller();

      //group 1
      const person1 = controller.addNewPerson();
      const person2 = controller.addNewPerson();
      const person3 = controller.addNewPerson();
      const person4 = controller.addNewPerson();
      const person5 = controller.addNewPerson();

      //group 2
      const person6 = controller.addNewPerson();
      const person7 = controller.addNewPerson();
      const person8 = controller.addNewPerson();
      const person9 = controller.addNewPerson();
      const person10 = controller.addNewPerson();

      //group 3
      const person11 = controller.addNewPerson();
      const person12 = controller.addNewPerson();
      const person13 = controller.addNewPerson();
      const person14 = controller.addNewPerson();
      const person15 = controller.addNewPerson();

      //group 4
      const person16 = controller.addNewPerson();
      const person17 = controller.addNewPerson();
      const person18 = controller.addNewPerson();
      const person19 = controller.addNewPerson();
      const person20 = controller.addNewPerson();

      //journey 1

      const paymentSetGroup1Journey1 = new Set([
        { amount: 573, to: person2 },
        { amount: 573, to: person3 },
        { amount: 573, to: person4 },
        { amount: 573, to: person5 },
      ]);

      const paymentSetGroup2Journey1 = new Set([
        { amount: 666, to: person7 },
        { amount: 666, to: person8 },
        { amount: 666, to: person9 },
        { amount: 666, to: person10 },
      ]);

      const paymentSetGroup3Journey1 = new Set([
        { amount: 444, to: person12 },
        { amount: 444, to: person13 },
        { amount: 444, to: person14 },
        { amount: 444, to: person15 },
      ]);

      const paymentSetGroup4Journey1 = new Set([
        { amount: 333, to: person17 },
        { amount: 333, to: person18 },
        { amount: 333, to: person19 },
        { amount: 333, to: person20 },
      ]);

      controller.addPaymentSetToPersonById(paymentSetGroup1Journey1, person1); // person 1 pays for group 1
      controller.addPaymentSetToPersonById(paymentSetGroup2Journey1, person6); // person 6 pays for group 2
      controller.addPaymentSetToPersonById(paymentSetGroup3Journey1, person11); // person 11 pays for group 3
      controller.addPaymentSetToPersonById(paymentSetGroup4Journey1, person16); // person 16 pays for group 4

      //journey 2

      const paymentSetGroup1Journey2 = new Set([
        { amount: 777, to: person17 },
        { amount: 777, to: person18 },
        { amount: 777, to: person19 },
        { amount: 777, to: person20 },
      ]);

      const paymentSetGroup2Journey2 = new Set([
        { amount: 684, to: person12 },
        { amount: 684, to: person13 },
        { amount: 684, to: person14 },
        { amount: 684, to: person15 },
      ]);

      const paymentSetGroup3Journey2 = new Set([
        { amount: 1220, to: person7 },
        { amount: 1220, to: person8 },
        { amount: 1220, to: person9 },
        { amount: 1220, to: person10 },
      ]);

      const paymentSetGroup4Journey2 = new Set([
        { amount: 332, to: person2 },
        { amount: 332, to: person3 },
        { amount: 332, to: person4 },
        { amount: 332, to: person5 },
      ]);

      controller.addPaymentSetToPersonById(paymentSetGroup1Journey2, person1); // person 1 pays for group 1
      controller.addPaymentSetToPersonById(paymentSetGroup2Journey2, person6); // person 6 pays for group 2
      controller.addPaymentSetToPersonById(paymentSetGroup3Journey2, person11); // person 11 pays for group 3
      controller.addPaymentSetToPersonById(paymentSetGroup4Journey2, person16); // person 16 pays for group 4

      const payments = controller.getSuggestedPayments();
      const expectedSuggestedPayments = [
        { amount: 1886, from: person7, to: person11 },
        { amount: 1886, from: person8, to: person11 },
        { amount: 1886, from: person9, to: person11 },
        { amount: 998, from: person10, to: person11 },
        { amount: 888, from: person10, to: person1 },
        { amount: 1128, from: person12, to: person1 },
        { amount: 1128, from: person13, to: person1 },
        { amount: 1128, from: person14, to: person1 },
        { amount: 1128, from: person15, to: person1 },
        { amount: 1110, from: person17, to: person6 },
        { amount: 1110, from: person18, to: person6 },
        { amount: 1110, from: person19, to: person6 },
        { amount: 1110, from: person20, to: person6 },
        { amount: 905, from: person2, to: person6 },
        { amount: 55, from: person3, to: person6 },
        { amount: 850, from: person3, to: person16 },
        { amount: 905, from: person4, to: person16 },
        { amount: 905, from: person5, to: person16 },
      ];

      expect(payments).toEqual(expectedSuggestedPayments);
    });
  });
});
